import { HTMLAttributes } from "react"

type SectionHeaderProps = HTMLAttributes<HTMLDivElement> & {
	children: React.ReactNode
	description?: string
}

export const SectionHeader = ({ description, children, className, ...props }: SectionHeaderProps) => {
	return (
		<div className={`sticky top-0 text-foreground px-5 py-3 ${className || ""}`} {...props} style={{ zIndex: 1000 + 20 }}>
			<h4 className="m-0">{children}</h4>
			{description && <p className="text-[var(--vscode-descriptionForeground)] text-sm mt-2 mb-0">{description}</p>}
		</div>
	)
}

export default SectionHeader
