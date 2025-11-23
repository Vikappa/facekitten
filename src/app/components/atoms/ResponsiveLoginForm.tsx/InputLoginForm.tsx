export type InputLoginFormProps = {
    id: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function InputLoginForm({ id, type, placeholder, value, onChange }: InputLoginFormProps) {
    return (
        <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 py-4 lg:focus:ring-[0.9px]"
        />
    )
}