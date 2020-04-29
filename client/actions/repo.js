import { CLONE_REPO } from './types';
import io from 'socket.io-client';
const socket = io(process.env.API_SERVER);

const cloneRepo = () => ({
    type: CLONE_REPO
});

export function cloneAriaAtRepo() {
    socket.emit('clone', 'clone the repo')
}