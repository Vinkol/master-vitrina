import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShowcaseNotFound } from './ShowcaseNotFound';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Глобальная ошибка React:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return <ShowcaseNotFound errorText="" />;
    }

    return this.props.children;
  }
}
