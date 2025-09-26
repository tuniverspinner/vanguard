import * as proto from "@shared/proto"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { Loader2, Volume2, VolumeX } from "lucide-react"
import React, { useCallback, useRef, useState } from "react"
import { UiServiceClient } from "@/services/grpc-client"

interface TtsButtonProps {
	text: string
	className?: string
	size?: "sm" | "md" | "lg"
}

export const TtsButton: React.FC<TtsButtonProps> = ({ text, className = "", size = "md" }) => {
	const [isPlaying, setIsPlaying] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const audioContextRef = useRef<AudioContext | null>(null)
	const currentSourceRef = useRef<AudioBufferSourceNode | null>(null)

	const iconSize = size === "sm" ? 14 : size === "md" ? 16 : 20

	const initializeAudioContext = useCallback(async () => {
		if (!audioContextRef.current) {
			try {
				audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
				if (audioContextRef.current.state === "suspended") {
					await audioContextRef.current.resume()
				}
			} catch (err) {
				console.error("Failed to initialize audio context:", err)
				throw new Error("Audio playback not supported")
			}
		}
		return audioContextRef.current
	}, [])

	const stopPlayback = useCallback(() => {
		if (currentSourceRef.current) {
			try {
				currentSourceRef.current.stop()
			} catch (e) {
				// Source might already be stopped
			}
			currentSourceRef.current = null
		}
		setIsPlaying(false)
	}, [])

	const playAudioBuffer = useCallback(
		async (audioBuffer: ArrayBuffer) => {
			try {
				const audioContext = await initializeAudioContext()

				// Stop any currently playing audio
				stopPlayback()

				// Create audio buffer from the received data
				const buffer = await audioContext.decodeAudioData(audioBuffer.slice(0))

				// Create and configure audio source
				const source = audioContext.createBufferSource()
				source.buffer = buffer
				source.connect(audioContext.destination)
				currentSourceRef.current = source

				// Set up event handlers
				source.onended = () => {
					setIsPlaying(false)
					currentSourceRef.current = null
				}

				// Start playback
				source.start(0)
				setIsPlaying(true)
			} catch (err) {
				console.error("Failed to play audio:", err)
				setIsPlaying(false)
				setError("Failed to play audio")
				throw err
			}
		},
		[initializeAudioContext, stopPlayback],
	)

	const handleTtsClick = useCallback(async () => {
		console.log(`[TTS-UI] TTS button clicked, isPlaying: ${isPlaying}, text length: ${text?.length || 0}`)

		if (isPlaying) {
			console.log(`[TTS-UI] Stopping playback`)
			stopPlayback()
			return
		}

		if (!text || text.trim().length === 0) {
			console.error(`[TTS-UI] Error: No text to speak`)
			setError("No text to speak")
			return
		}

		console.log(`[TTS-UI] Starting TTS generation for text: "${text.substring(0, 50)}..."`)
		setIsLoading(true)
		setError(null)

		try {
			const audioChunks: Uint8Array[] = []

			// Try to get cached speech first
			console.log(`[TTS-UI] Checking cache for text...`)
			const unsubscribeCached = UiServiceClient.getCachedSpeech(proto.cline.StringRequest.create({ value: text }), {
				onResponse: (response: proto.cline.Bytes) => {
					console.log(`[TTS-UI] Cache response received, chunk size: ${response.value?.length || 0}`)
					if (response.value) {
						audioChunks.push(new Uint8Array(response.value))
					}
				},
				onComplete: async () => {
					console.log(`[TTS-UI] Cache check complete, total chunks: ${audioChunks.length}`)
					if (audioChunks.length > 0) {
						// Combine chunks and play
						const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0)
						console.log(`[TTS-UI] Playing cached audio, total size: ${totalLength} bytes`)
						const combinedBuffer = new Uint8Array(totalLength)
						let offset = 0
						for (const chunk of audioChunks) {
							combinedBuffer.set(chunk, offset)
							offset += chunk.length
						}
						await playAudioBuffer(combinedBuffer.buffer)
					} else {
						// No cached speech, generate new
						console.log(`[TTS-UI] No cached speech found, generating new...`)
						await generateNewSpeech()
					}
					setIsLoading(false)
				},
				onError: (error) => {
					console.log(`[TTS-UI] Cache check failed:`, error)
					console.log(`[TTS-UI] No cached speech available, generating new...`)
					generateNewSpeech()
				},
			})

			const generateNewSpeech = async () => {
				console.log(`[TTS-UI] Starting new speech generation...`)
				const newAudioChunks: Uint8Array[] = []

				const unsubscribeNew = UiServiceClient.generateSpeech(proto.cline.StringRequest.create({ value: text }), {
					onResponse: (response: proto.cline.Bytes) => {
						console.log(`[TTS-UI] Generation response received, chunk size: ${response.value?.length || 0}`)
						if (response.value) {
							newAudioChunks.push(new Uint8Array(response.value))
						}
					},
					onComplete: async () => {
						console.log(`[TTS-UI] Generation complete, total chunks: ${newAudioChunks.length}`)
						if (newAudioChunks.length > 0) {
							// Combine chunks and play
							const totalLength = newAudioChunks.reduce((sum, chunk) => sum + chunk.length, 0)
							console.log(`[TTS-UI] Playing generated audio, total size: ${totalLength} bytes`)
							const combinedBuffer = new Uint8Array(totalLength)
							let offset = 0
							for (const chunk of newAudioChunks) {
								combinedBuffer.set(chunk, offset)
								offset += chunk.length
							}
							await playAudioBuffer(combinedBuffer.buffer)
						} else {
							console.error(`[TTS-UI] Error: No audio data received`)
							setError("No audio data received")
						}
						setIsLoading(false)
					},
					onError: (error) => {
						console.error(`[TTS-UI] Generation failed:`, error)
						setError("Failed to generate speech")
						setIsLoading(false)
					},
				})

				// Clean up subscription after a timeout
				setTimeout(() => {
					console.log(`[TTS-UI] Cleaning up generation subscription after timeout`)
					unsubscribeNew()
				}, 30000) // 30 second timeout
			}

			// Clean up cached speech subscription after a timeout
			setTimeout(() => {
				console.log(`[TTS-UI] Cleaning up cache subscription after timeout`)
				unsubscribeCached()
			}, 5000) // 5 second timeout for cache check
		} catch (err) {
			console.error(`[TTS-UI] TTS error:`, err)
			setError(err instanceof Error ? err.message : "TTS failed")
			setIsPlaying(false)
			setIsLoading(false)
		}
	}, [text, isPlaying, playAudioBuffer, stopPlayback])

	const getIcon = () => {
		if (isLoading) {
			return <Loader2 className="animate-spin" size={iconSize} />
		}
		if (isPlaying) {
			return <VolumeX size={iconSize} />
		}
		return <Volume2 size={iconSize} />
	}

	const getTooltip = () => {
		if (error) return `Error: ${error}`
		if (isLoading) return "Generating speech..."
		if (isPlaying) return "Stop playback"
		return "Read aloud"
	}

	return (
		<VSCodeButton
			appearance="icon"
			aria-label={isPlaying ? "Stop text-to-speech" : "Start text-to-speech"}
			className={className}
			disabled={isLoading}
			onClick={handleTtsClick}
			title={getTooltip()}>
			{getIcon()}
		</VSCodeButton>
	)
}
