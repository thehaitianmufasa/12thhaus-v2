import { dark } from '@clerk/themes'

export const clerkTheme = {
  appearance: {
    baseTheme: undefined, // Use light theme
    variables: {
      colorPrimary: '#9333ea', // Purple-600
      colorText: '#1f2937', // Gray-900
      colorTextSecondary: '#6b7280', // Gray-500
      colorBackground: '#ffffff',
      colorInputBackground: '#ffffff',
      colorInputText: '#1f2937',
      colorDanger: '#ef4444',
      colorSuccess: '#10b981',
      colorWarning: '#f59e0b',
      colorNeutral: '#6b7280',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontFamilyButtons: 'Inter, system-ui, sans-serif',
      fontSize: '1rem',
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      borderRadius: '0.5rem',
      spacingUnit: '1rem',
    },
    elements: {
      // Root and card styling
      rootBox: 'mx-auto',
      card: 'bg-white shadow-xl rounded-2xl p-8 border border-purple-100',
      
      // Header styling - Hide default titles
      headerTitle: 'hidden',
      headerSubtitle: 'hidden',
      header: 'hidden',
      
      // Form elements
      formButtonPrimary: 
        'bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200',
      formButtonSecondary: 
        'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-3 px-4 rounded-lg transition-colors duration-200',
      formFieldInput: 
        'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200',
      formFieldLabel: 
        'block text-sm font-medium text-gray-700 mb-1',
      formFieldLabelRow: 
        'mb-1',
      
      // Social buttons
      socialButtonsBlockButton: 
        'flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-gray-700',
      socialButtonsBlockButtonText: 
        'font-medium',
      socialButtonsProviderIcon: 
        'w-5 h-5',
      
      // Divider
      dividerLine: 'bg-gray-300',
      dividerText: 'px-2 bg-white text-gray-500 text-sm',
      
      // Footer elements - Show sign in/sign up links
      footer: 'mt-6 text-center',
      footerAction: 'mt-4 text-center',
      footerActionLink: 'text-purple-600 hover:text-purple-700 font-medium transition-colors',
      footerActionText: 'text-gray-600 text-sm',
      
      // Hide Clerk branding
      footerText: 'hidden',
      poweredByClerk: 'hidden',
      
      // Form structure
      form: 'space-y-6',
      formFieldRow: 'space-y-1',
      
      // Messages
      formFieldSuccessText: 'text-green-600 text-sm mt-1',
      formFieldErrorText: 'text-red-600 text-sm mt-1',
      formResendCodeLink: 'text-purple-600 hover:text-purple-700 text-sm font-medium',
      
      // Logo elements - Hide default clerk logo
      logoBox: 'hidden',
      logoImage: 'hidden',
      
      // Buttons
      formButtonReset: 'text-purple-600 hover:text-purple-700 font-medium text-sm',
      backLink: 'text-gray-600 hover:text-gray-700 text-sm',
      
      // Avatar
      avatarBox: 'rounded-full',
      avatarImage: 'rounded-full',
      
      // Badge
      badge: 'bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium',
    },
    layout: {
      socialButtonsPlacement: 'bottom',
      socialButtonsVariant: 'blockButton',
      showOptionalFields: true,
    },
  },
}

export const clerkThemeWithLogo = {
  ...clerkTheme,
  appearance: {
    ...clerkTheme.appearance,
    elements: {
      ...clerkTheme.appearance.elements,
      // Add logo
      logoBox: 'flex justify-center mb-6',
      logoImage: 'hidden', // Hide Clerk logo
      // Custom header with 12thhaus branding
      headerRoot: 'mb-8',
      header: 'text-center mb-8',
    },
  },
}