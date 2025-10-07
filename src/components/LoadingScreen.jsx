import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loading screen component
 */
const LoadingScreen = ({ message = 'Loading...', fullScreen = true }) => {
  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* Animated Logo or Spinner */}
        <motion.div
          className="mb-4 flex justify-center"
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
        </motion.div>

        {/* Loading Message */}
        <motion.p
          className="text-gray-600 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingScreen;