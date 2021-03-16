import React, { useState, useCallback } from 'react';
import { Container } from 'react-bootstrap';

const keyMappings = {
    x: 'X / Shift+X',
    f: 'F / Shift+F'
};

const MappingDemo = () => {
    const [command, setCommand] = useState('x');
    const [role, setRole] = useState('checkbox');
    const changeCommand = useCallback(
        event => {
            setCommand(event.target.value);
        },
        [setCommand]
    );
    const changeRole = useCallback(
        event => {
            setRole(event.target.value);
        },
        [setRole]
    );
    return (
        <Container as="main">
            <ul>
                <li>
                    <div>
                        <code>press_until_role</code>&nbsp;
                        <select type="text" onChange={changeCommand}>
                            <option selected={command === 'x'}>x</option>
                            <option selected={command === 'f'}>f</option>
                        </select>
                        <select type="text" onChange={changeRole}>
                            <option selected={role === 'checkbox'}>
                                checkbox
                            </option>
                            <option selected={role === 'menubar'}>
                                menubar
                            </option>
                        </select>
                    </div>
                    <div>
                        Using the command <code>{keyMappings[command]}</code>,
                        navigate to the first <code>{role}</code>.
                    </div>
                </li>
            </ul>
        </Container>
    );
};

export default MappingDemo;
