import Reactotron from 'reactotron-react-native';

// biome-ignore lint/correctness/useHookAtTopLevel: useReactNative is not a React hook
Reactotron.configure() // controls connection & communication settings
  .useReactNative() // add all built-in react native plugins
  .connect(); // let's connect!
