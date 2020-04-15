import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';
import App from '../components/App';
import Login from '../components/Login';
import Signup from '../components/Signup';

storiesOf('Welcome', module).add('to Storybook', () => (
    <Welcome showApp={linkTo('Button')} />
));

storiesOf('Button', module)
    .add('with text', () => (
        <Button onClick={action('clicked')}>Hello Button</Button>
    ))
    .add('with some emoji', () => (
        <Button onClick={action('clicked')}>
            <span role="img" aria-label="so cool">
                😀 😎 👍 💯
            </span>
        </Button>
    ));

storiesOf('App', module).add('the app', () => <App />);
storiesOf('Login', module).add('login button', () => (
    <Login githubClientId={'12345'} />
));

storiesOf('Signup', module).add('signup button', () => (
    <Signup onClick={action('clicked')} />
));
