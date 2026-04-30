type SubtitleProps = {
    subtitle: string,
    className?: string;
    centered?: boolean;
}

export default function Subtitle({ subtitle, className = "", centered = false }: SubtitleProps) {
    // Detectar si className contiene estilos específicos
    const hasFontSize = /text-\w+/.test(className);
    const hasWeight = /font-\w+/.test(className);
    const hasColor = /text-[a-z]/.test(className);
    const hasTracking = /tracking-\w+/.test(className);

    const baseClasses = centered ? "text-center" : "";
    const fontSizeClasses = !hasFontSize ? "text-lg sm:text-xl" : "";
    const weightClasses = !hasWeight ? "font-semibold" : "";
    const colorClasses = !hasColor ? "text-gray-700" : "";
    const trackingClasses = !hasTracking ? "tracking-normal" : "";

    return <h2 className={`${baseClasses} ${fontSizeClasses} ${weightClasses} ${colorClasses} ${trackingClasses} ${className}`.trim()}>
        {subtitle}
    </h2>
}
