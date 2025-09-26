import * as proto from "@shared/proto"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { Loader2, Volume2, VolumeX } from "lucide-react"
import React, { useCallback, useRef, useState } from "react"
import HeroTooltip from "@/components/common/HeroTooltip"
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
			console.log(`[TTS-UI] playAudioBuffer called with buffer size: ${audioBuffer.byteLength} bytes`)
			try {
				const audioContext = await initializeAudioContext()
				console.log(`[TTS-UI] AudioContext initialized, state: ${audioContext.state}`)

				// Stop any currently playing audio
				stopPlayback()

				console.log(`[TTS-UI] Decoding audio data...`)
				// Create audio buffer from the received data
				const buffer = await audioContext.decodeAudioData(audioBuffer.slice(0))
				console.log(
					`[TTS-UI] Audio decoded successfully, duration: ${buffer.duration}s, sampleRate: ${buffer.sampleRate}Hz`,
				)

				// Create and configure audio source
				const source = audioContext.createBufferSource()
				source.buffer = buffer
				source.connect(audioContext.destination)
				currentSourceRef.current = source

				// Set up event handlers
				source.onended = () => {
					console.log(`[TTS-UI] Audio playback ended naturally`)
					setIsPlaying(false)
					currentSourceRef.current = null
				}

				console.log(`[TTS-UI] Starting audio playback...`)
				// Start playback
				source.start(0)
				setIsPlaying(true)
				console.log(`[TTS-UI] Audio playback started successfully`)
			} catch (err) {
				console.error(`[TTS-UI] Failed to play audio:`, err)
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
			// Generate new speech directly (skip cache for now since it's causing issues)
			console.log(`[TTS-UI] Starting speech generation (skipping cache)...`)
			const audioChunks: Uint8Array[] = []

			const unsubscribe = UiServiceClient.generateSpeech(proto.cline.StringRequest.create({ value: text }), {
				onResponse: (response: proto.cline.Bytes) => {
					console.log(`[TTS-UI] Generation response received, chunk size: ${response.value?.length || 0}`)
					if (response.value) {
						audioChunks.push(new Uint8Array(response.value))
					}
				},
				onComplete: async () => {
					console.log(`[TTS-UI] Generation complete, total chunks: ${audioChunks.length}`)
					if (audioChunks.length > 0) {
						// Combine chunks and play
						const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0)
						console.log(`[TTS-UI] Playing generated audio, total size: ${totalLength} bytes`)
						const combinedBuffer = new Uint8Array(totalLength)
						let offset = 0
						for (const chunk of audioChunks) {
							combinedBuffer.set(chunk, offset)
							offset += chunk.length
						}
						// Save audio file for debugging (optional)
						console.log(`[TTS-UI] Saving audio file for debugging...`)
						try {
							// Create a blob and download link for debugging
							const blob = new Blob([combinedBuffer.buffer], { type: "audio/wav" })
							const url = URL.createObjectURL(blob)
							const a = document.createElement("a")
							a.href = url
							a.download = `tts-debug-${Date.now()}.wav`
							document.body.appendChild(a)
							a.click()
							document.body.removeChild(a)
							URL.revokeObjectURL(url)
							console.log(`[TTS-UI] Audio file saved for debugging`)
						} catch (saveErr) {
							console.warn(`[TTS-UI] Failed to save debug audio file:`, saveErr)
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
					console.error(`[TTS-UI] Error details:`, error.message, error.stack)
					setError(`Failed to generate speech: ${error.message}`)
					setIsLoading(false)
				},
			})

			// Clean up subscription after a timeout
			setTimeout(() => {
				console.log(`[TTS-UI] Cleaning up generation subscription after timeout`)
				unsubscribe()
			}, 30000) // 30 second timeout
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
		<HeroTooltip
			content={
				error ? (
					<div className="bg-red-50 text-red-800 border border-red-200 rounded p-2 max-w-[300px] text-xs">{error}</div>
				) : (
					getTooltip()
				)
			}
			delay={error ? 0 : 500}>
			<VSCodeButton
				appearance="icon"
				aria-label={isPlaying ? "Stop text-to-speech" : "Start text-to-speech"}
				className={className}
				disabled={isLoading}
				onClick={handleTtsClick}>
				{getIcon()}
			</VSCodeButton>
		</HeroTooltip>
	)
}
