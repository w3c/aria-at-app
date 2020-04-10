import App from '@components/App';
import Login from '@components/Login';
import UserSettings from '@components/UserSettings';
import ManageCycles from '@components/ManageCycles';
import InitiateCycle from '@components/InitiateCycle';

export default [
    {
        component: App,
        routes: [
            {
                path: '/login',
                exact: true,
                component: Login,
                githubClientId: process.env.GITHUB_CLIENT_ID
            },
            {
                path: '/account/settings',
                exact: true,
                component: UserSettings
            },
            {
                path: '/cycles',
                exact: true,
                component: ManageCycles
            },
            {
                path: '/initiate-cycle',
                exact: true,
                component: InitiateCycle
            }
        ]
    }
];
