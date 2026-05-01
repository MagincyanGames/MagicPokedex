type TitleProps = {
    title: string,
    className?: string;
    centered?: boolean;
    onClick?: () => void;
}

export default function Title({ title, onClick, className = "", centered = false }: TitleProps) {
    // Detectar si className contiene estilos específicos
    const hasFontSize = /text-\w+/.test(className);
    const hasWeight = /font-\w+/.test(className);
    const hasColor = /text-[a-z]/.test(className);
    const hasTracking = /tracking-\w+/.test(className);

    const baseClasses = centered ? "text-center" : "";
    const fontSizeClasses = !hasFontSize ? "text-3xl sm:text-4xl" : "";
    const weightClasses = !hasWeight ? "font-bold" : "";
    const colorClasses = !hasColor ? "text-gray-900" : "";
    const trackingClasses = !hasTracking ? "tracking-tight" : "";

    return <h1 className={`${baseClasses} ${fontSizeClasses} ${weightClasses} ${colorClasses} ${trackingClasses} ${className}`.trim()} onClick={onClick}>
        {title}
    </h1>
}