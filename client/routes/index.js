import App from '@components/App';
import Login from '@components/Login';

export default [
    {
        component: App,
        routes: [
            {
                path: '/login',
                exact: true,
                component: Login,
                githubClientId: process.env.GITHUB_CLIENT_ID
            }
        ]
    }
];
