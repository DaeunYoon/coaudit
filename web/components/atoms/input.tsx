import * as React from 'react';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, placeholder, ...props }) => {
    return (
      <label className="flex items-center gap-2 text-white">
        <input
          {...props}
          type={type || 'text'}
          className="input input-bordered w-full text-gray-600"
          placeholder={placeholder || 'search'}
        />
      </label>
    );
  }
);
Input.displayName = 'Input';

export { Input };
