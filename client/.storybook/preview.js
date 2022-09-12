import '../../node_modules/bootstrap/dist/css/bootstrap.css';
import '../../node_modules/@fortawesome/fontawesome-svg-core/styles.css';
import '!style-loader!css-loader!sass-loader!../scss/custom.scss'; // using inline webpack loaders for scss
import '../static/index.css';
import { MockedProvider } from '@apollo/client/testing';
export const parameters = {
    apolloClient: {
      MockedProvider,
      // any props you want to pass to MockedProvider on every story
      addTypename: false
    },
  };
