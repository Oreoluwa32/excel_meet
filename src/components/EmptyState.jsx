import { FileQuestion, Search, Inbox, AlertCircle } from 'lucide-react';

/**
 * Reusable EmptyState component
 * Displays when there's no data to show
 */
const EmptyState = ({
  type = 'default',
  title,
  description,
  icon: CustomIcon,
  action,
  actionText,
  onAction,
  className = ''
}) => {
  // Default icons based on type
  const defaultIcons = {
    default: Inbox,
    search: Search,
    error: AlertCircle,
    notFound: FileQuestion
  };

  const Icon = CustomIcon || defaultIcons[type] || defaultIcons.default;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {/* Icon */}
      <div className="mb-4 p-4 bg-gray-100 rounded-full">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>

      {/* Title */}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p className="text-gray-600 max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Action button */}
      {(action || (actionText && onAction)) && (
        <div>
          {action || (
            <button
              onClick={onAction}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;