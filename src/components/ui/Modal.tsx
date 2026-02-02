import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  gradient?: 'indigo' | 'purple' | 'teal' | 'emerald' | 'blue' | 'rose' | 'orange';
}

const gradients = {
  indigo: {
    bg: 'from-indigo-500 via-purple-500 to-pink-500',
    border: 'border-indigo-400/50',
    iconBg: 'from-indigo-400 to-purple-500',
    buttonBg: 'from-indigo-500 via-purple-500 to-pink-500',
    focusRing: 'focus:ring-indigo-400',
    labelColor: 'text-indigo-700 dark:text-indigo-300',
  },
  purple: {
    bg: 'from-purple-500 via-pink-500 to-rose-500',
    border: 'border-purple-400/50',
    iconBg: 'from-purple-400 to-pink-500',
    buttonBg: 'from-purple-500 via-pink-500 to-rose-500',
    focusRing: 'focus:ring-purple-400',
    labelColor: 'text-purple-700 dark:text-purple-300',
  },
  teal: {
    bg: 'from-teal-500 via-cyan-500 to-blue-500',
    border: 'border-teal-400/50',
    iconBg: 'from-teal-400 to-cyan-500',
    buttonBg: 'from-teal-500 via-cyan-500 to-blue-500',
    focusRing: 'focus:ring-teal-400',
    labelColor: 'text-teal-700 dark:text-teal-300',
  },
  emerald: {
    bg: 'from-emerald-500 via-green-500 to-teal-500',
    border: 'border-emerald-400/50',
    iconBg: 'from-emerald-400 to-green-500',
    buttonBg: 'from-emerald-500 via-green-500 to-teal-500',
    focusRing: 'focus:ring-emerald-400',
    labelColor: 'text-emerald-700 dark:text-emerald-300',
  },
  blue: {
    bg: 'from-blue-500 via-indigo-500 to-purple-500',
    border: 'border-blue-400/50',
    iconBg: 'from-blue-400 to-indigo-500',
    buttonBg: 'from-blue-500 via-indigo-500 to-purple-500',
    focusRing: 'focus:ring-blue-400',
    labelColor: 'text-blue-700 dark:text-blue-300',
  },
  rose: {
    bg: 'from-rose-500 via-pink-500 to-purple-500',
    border: 'border-rose-400/50',
    iconBg: 'from-rose-400 to-pink-500',
    buttonBg: 'from-rose-500 via-pink-500 to-purple-500',
    focusRing: 'focus:ring-rose-400',
    labelColor: 'text-rose-700 dark:text-rose-300',
  },
  orange: {
    bg: 'from-orange-500 via-amber-500 to-yellow-500',
    border: 'border-orange-400/50',
    iconBg: 'from-orange-400 to-amber-500',
    buttonBg: 'from-orange-500 via-amber-500 to-yellow-500',
    focusRing: 'focus:ring-orange-400',
    labelColor: 'text-orange-700 dark:text-orange-300',
  },
};

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  size = 'md',
  gradient = 'indigo',
}) => {
  if (!isOpen) return null;

  const colors = gradients[gradient];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${sizes[size]} animate-slideUp`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effect Behind */}
        <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} rounded-3xl blur-xl opacity-30 animate-pulse`}></div>

        {/* Main Modal Container */}
        <div className={`relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border-2 ${colors.border}`}>

          {/* Header with Gradient */}
          <div className={`relative bg-gradient-to-r ${colors.bg} p-6`}>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <Sparkles className="absolute top-4 right-16 w-6 h-6 text-white/40 animate-pulse" />

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all duration-300 hover:rotate-90 hover:scale-110 z-[1001]"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon and Title */}
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg`}>
                <div className="text-white">
                  {icon}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                  {title}
                </h2>
                <p className="text-white/70 text-sm mt-1">Remplissez les informations ci-dessous</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[75vh] overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ModalInputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  gradient?: keyof typeof gradients;
  icon?: React.ReactNode;
}

export const ModalInput: React.FC<ModalInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  gradient = 'indigo',
  icon,
}) => {
  const colors = gradients[gradient];

  return (
    <div className="group">
      <label className={`block text-sm font-semibold ${colors.labelColor} mb-2 transition-colors`}>
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
            bg-white dark:bg-gray-800 
            focus:border-transparent focus:ring-4 ${colors.focusRing} focus:ring-opacity-30
            transition-all duration-300 outline-none
            text-gray-800 dark:text-gray-200 placeholder-gray-400
            hover:border-gray-300 dark:hover:border-gray-600
            shadow-sm hover:shadow-md focus:shadow-lg`}
        />
      </div>
    </div>
  );
};

interface ModalSelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  gradient?: keyof typeof gradients;
}

export const ModalSelect: React.FC<ModalSelectProps> = ({
  label,
  value,
  onChange,
  options,
  required = false,
  gradient = 'indigo',
}) => {
  const colors = gradients[gradient];

  return (
    <div className="group">
      <label className={`block text-sm font-semibold ${colors.labelColor} mb-2`}>
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
          bg-white dark:bg-gray-800 
          focus:border-transparent focus:ring-4 ${colors.focusRing} focus:ring-opacity-30
          transition-all duration-300 outline-none cursor-pointer
          text-gray-800 dark:text-gray-200
          hover:border-gray-300 dark:hover:border-gray-600
          shadow-sm hover:shadow-md focus:shadow-lg
          appearance-none bg-no-repeat bg-right
          `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1.5em 1.5em',
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface ModalTextareaProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  gradient?: keyof typeof gradients;
}

export const ModalTextarea: React.FC<ModalTextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  gradient = 'indigo',
}) => {
  const colors = gradients[gradient];

  return (
    <div className="group">
      <label className={`block text-sm font-semibold ${colors.labelColor} mb-2`}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
          bg-white dark:bg-gray-800 
          focus:border-transparent focus:ring-4 ${colors.focusRing} focus:ring-opacity-30
          transition-all duration-300 outline-none resize-none
          text-gray-800 dark:text-gray-200 placeholder-gray-400
          hover:border-gray-300 dark:hover:border-gray-600
          shadow-sm hover:shadow-md focus:shadow-lg`}
      />
    </div>
  );
};

interface ModalButtonsProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitText?: string;
  cancelText?: string;
  gradient?: keyof typeof gradients;
  isLoading?: boolean;
}

export const ModalButtons: React.FC<ModalButtonsProps> = ({
  onCancel,
  onSubmit,
  submitText = 'Créer',
  cancelText = 'Annuler',
  gradient = 'indigo',
  isLoading = false,
}) => {
  const colors = gradients[gradient];

  return (
    <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-3 px-6 rounded-xl font-semibold
          bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
          hover:bg-gray-200 dark:hover:bg-gray-700
          transition-all duration-300 
          shadow-md hover:shadow-lg
          flex items-center justify-center gap-2"
      >
        <X className="w-5 h-5" />
        {cancelText}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading}
        className={`flex-1 py-3 px-6 rounded-xl font-semibold text-white
          bg-gradient-to-r ${colors.buttonBg}
          hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]
          transition-all duration-300 
          shadow-lg hover:shadow-xl
          flex items-center justify-center gap-2
          disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Sparkles className="w-5 h-5" />
        )}
        {submitText}
      </button>
    </div>
  );
};

interface ModalImageUploadProps {
  label: string;
  value: string;
  onImageChange: (url: string) => void;
  gradient?: keyof typeof gradients;
}

export const ModalImageUpload: React.FC<ModalImageUploadProps> = ({
  label,
  value,
  onImageChange,
  gradient = 'indigo',
}) => {
  const colors = gradients[gradient];
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="group">
      <label className={`block text-sm font-semibold ${colors.labelColor} mb-2`}>
        {label}
      </label>
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all">
        <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <Sparkles className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <div className="flex flex-col gap-2 flex-1 w-full sm:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`px-4 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r ${colors.buttonBg} shadow-lg hover:shadow-xl transition-all whitespace-nowrap`}
          >
            PARCOURIR...
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onImageChange(e.target.value)}
              placeholder="Ou collez un lien URL ici..."
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:border-indigo-500 transition-all font-mono truncate"
            />
            {value && (
              <button
                type="button"
                onClick={() => onImageChange('')}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                title="Supprimer l'image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
