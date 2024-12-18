const path = require('path');

require('@testing-library/jest-dom');

// Mock Firebase configuration
jest.mock(path.resolve(__dirname, 'src/lib/firebase'), () => ({
  auth: {
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn()
  },
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn()
  }
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Navigate: () => null
}));

// Mock external services and libraries
jest.mock(path.resolve(__dirname, 'src/services/aiService'), () => ({
  aiService: {
    matchSkills: jest.fn()
  }
}));

jest.mock(path.resolve(__dirname, 'src/services/aiMatching'), () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock(path.resolve(__dirname, 'src/lib/performanceOptimizer'), () => ({
  debounce: jest.fn((fn) => fn)
}));

jest.mock('styled-components', () => ({
  __esModule: true,
  default: jest.fn(),
  styled: jest.fn()
}));

// Global setup
beforeEach(() => {
  jest.clearAllMocks();
});
