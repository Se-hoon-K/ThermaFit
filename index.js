import { registerRootComponent } from 'expo';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import App from './App';
import { widgetTaskHandler } from './src/widgets/widgetTaskHandler';

// Must be imported at module level so TaskManager.defineTask runs before
// the OS can wake the background task.
import './src/tasks/backgroundRefresh';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);

// Register the Android widget task handler
registerWidgetTaskHandler(widgetTaskHandler);
