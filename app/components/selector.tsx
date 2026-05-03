interface SelectorProps {
    title?: string;
    nullOption?: string;
    options?: Array<{ name: string; display?: string }>;
    value?: string | null;
    onChange: (value: string) => void;
    allowNull?: boolean;
}

export default function Selector({
    title,
    options,
    nullOption = 'Ninguno',
    value,
    onChange,
    allowNull = true,
}: SelectorProps) {
    return (
        <div className="flex justify-center items-center gap-4">
            {title && <label className="text-white text-lg font-semibold">{title}</label>}
            <select
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-lg font-semibold hover:cursor-pointer text-black bg-white appearance-none text-center"
            >
                {allowNull && <option value="">{nullOption}</option>}
                {options && options.map((option) => (
                    <option key={option.name} value={option.name}>
                        {option.display || option.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
