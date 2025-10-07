import { useEffect, useRef } from 'react';

/**
 * Custom hook to detect clicks outside of a component
 * Useful for dropdowns, modals, popovers, etc.
 * 
 * @param {Function} handler - Function to call when clicked outside
 * @returns {React.Ref} Ref to attach to the component
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const dropdownRef = useClickOutside(() => setIsOpen(false));
 * 
 * return (
 *   <div ref={dropdownRef}>
 *     <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
 *     {isOpen && <DropdownMenu />}
 *   </div>
 * );
 */
export const useClickOutside = (handler) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler(event);
      }
    };

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      // Unbind the event listener on cleanup
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handler]);

  return ref;
};

export default useClickOutside;