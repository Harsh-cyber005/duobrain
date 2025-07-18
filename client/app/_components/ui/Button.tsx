import { Loader2 } from "lucide-react";
import React, { ReactElement } from "react";

type Variants = "primary" | "secondary" | "danger" | "none" | "black";
type Sizes = "sm" | "md" | "lg" | "square" | "square-md" | "crumb";
interface ButtonProps {
    variant: Variants;
    size: Sizes;
    width?: string;
    text?: string;
    startIcon?: ReactElement;
    onClick?: (e:React.MouseEvent<HTMLButtonElement>) => void;
    onMouseEnter?: (e:React.MouseEvent<HTMLButtonElement>) => void;
    onMouseLeave?: (e:React.MouseEvent<HTMLButtonElement>) => void;
    loading?: boolean;
    disabled?: boolean;
}

const VariantStyles: Record<Variants, string> = {
    primary: "bg-primaryBtn text-white hover:bg-primaryBtn-hover",
    secondary: "bg-secondaryBtn text-primaryBtn hover:bg-secondaryBtn-hover",
    danger: "bg-red-600 text-white hover:bg-red-700",
    none: "bg-transparent text-black hover:bg-gray-200",
    black: "bg-black text-white hover:bg-gray-700 duration-200"
};
const SizeStyles: Record<Sizes, string> = {
    sm: "py-1 px-3 text-sm",
    md: "py-2 px-6 text-md",
    lg: "py-4 px-12 text-lg",
    crumb: "py-1 px-3 text-lg",
    square: "py-1 px-1 text-sm",
    "square-md": "py-2 px-3 text-md"
};

export const Button: React.FC<ButtonProps> = ({ variant, size, text, startIcon, width, onClick, loading, onMouseEnter, onMouseLeave, disabled }: ButtonProps) => {
    return (
        <button disabled={disabled} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick} className={`${VariantStyles[variant]} ${SizeStyles[size]} ${width} rounded-md duration-200 flex justify-center items-center gap-2`}>
            {
                !loading &&
                <div className="flex justify-center items-center gap-2">
                    <span>
                        {startIcon}
                    </span>
                    {
                        text && <span>{text}</span>
                    }
                </div>
            }
            {
                loading &&
                <div className="flex justify-center items-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Loader2 className="animate-spin stroke-2 size-6" />
                </div>
            }
        </button>
    )
}