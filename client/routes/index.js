import App from '@components/App';
import Login from '@components/Login';
import Signup from '@components/Signup';
import SignupInstructions from '@components/SignupInstructions';
import UserSettings from '@components/UserSettings';
import ManageCycles from '@components/ManageCycles';
import InitiateCycle from '@components/InitiateCycle';
import CycleSummary from '@components/CycleSummary';

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
                path: '/signup',
                exact: true,
                component: Signup
            },
            {
                path: '/signupInstructions',
                exact: true,
                component: SignupInstructions
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
                path: '/cycle/:cycleId/summary',
                component: CycleSummary,
            },
            {
                path: '/initiate-cycle',
                exact: true,
                component: InitiateCycle
            }
        ]
    }
];
