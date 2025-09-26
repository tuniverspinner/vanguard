import React from "react"
import styled from "styled-components"

// ======== Interfaces ========

interface HoverActionsProps {
	children: React.ReactNode
	position?: "top-right" | "bottom-right"
	className?: string
}

// ======== Styled Components ========

// Container that provides relative positioning context
const ActionsContainer = styled.div`
	position: relative;
`

// Button container with flexible positioning and hover behavior
const ButtonTray = styled.div<{ $position?: "top-right" | "bottom-right" }>`
	position: absolute;
	display: flex;
	gap: 4px;
	${(props) => {
		switch (props.$position) {
			case "bottom-right":
				return "bottom: 2px; right: 2px;"
			case "top-right":
			default:
				return "top: 5px; right: 5px;"
		}
	}}
	z-index: 1;
	opacity: 0;

	${ActionsContainer}:hover & {
		opacity: 1;
	}
`

// ======== Component Implementation ========

/**
 * Container for action buttons that appear on hover
 * Provides consistent positioning and hover behavior for multiple buttons
 */
export const HoverActions: React.FC<HoverActionsProps> = ({ children, position = "bottom-right", className = "" }) => {
	return (
		<ActionsContainer className={className}>
			<ButtonTray $position={position}>{children}</ButtonTray>
		</ActionsContainer>
	)
}

export default HoverActions
