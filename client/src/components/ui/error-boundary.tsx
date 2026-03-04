import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { fadeIn } from "@/lib/motion";

type FallbackProps = {
	error: Error;
	resetErrorBoundary: () => void;
};

type Props = {
	children: ReactNode;
	fallback?: (props: FallbackProps) => ReactNode;
};

type State = {
	error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
	state: State = { error: null };

	static getDerivedStateFromError(error: Error): State {
		return { error };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error("[ErrorBoundary]", error, info.componentStack);
	}

	resetErrorBoundary = () => {
		this.setState({ error: null });
	};

	render() {
		const { error } = this.state;
		if (!error) return this.props.children;

		if (this.props.fallback) {
			return this.props.fallback({
				error,
				resetErrorBoundary: this.resetErrorBoundary,
			});
		}

		return (
			<motion.div
				className="flex flex-col items-center justify-center gap-3 py-10 text-center"
				variants={fadeIn}
				initial="initial"
				animate="animate"
			>
				<AlertCircle className="h-8 w-8 text-danger" />
				<p className="text-sm text-muted-foreground">
					Something went wrong rendering this section.
				</p>
				<Button
					variant="outline"
					size="sm"
					className="gap-1.5"
					onClick={this.resetErrorBoundary}
				>
					<RefreshCw className="h-3.5 w-3.5" />
					Try Again
				</Button>
			</motion.div>
		);
	}
}
