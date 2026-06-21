const mockEvents = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
};

const mockRouter = {
  push: jest.fn().mockResolvedValue(true),
  replace: jest.fn().mockResolvedValue(true),
  back: jest.fn(),
  reload: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  events: mockEvents,
  asPath: "/",
  pathname: "/",
  route: "/",
  query: {},
  isReady: true,
  isFallback: false,
  isPreview: false,
  basePath: "",
  locale: undefined,
  locales: undefined,
  defaultLocale: undefined,
};

module.exports = {
  __esModule: true,
  useRouter: jest.fn(() => mockRouter),
  default: mockRouter,
};
