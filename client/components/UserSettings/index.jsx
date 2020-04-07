import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class UserSettings extends Component {
    render() {
        const { isLoggedIn, username, name } = this.props;
        const contents = isLoggedIn ? (
            <p data-test="user-settings-authorized">
                {username} {name}
            </p>
        ) : (
            <p data-test="user-settings-unauthorized">Unauthorized</p>
        );

        return <div data-test="component-user-settings">{contents}</div>;
    }
}

UserSettings.propTypes = {
    isLoggedIn: PropTypes.bool,
    username: PropTypes.string,
    name: PropTypes.string
};

const mapStateToProps = state => {
    const { isLoggedIn, username, name } = state.login;
    return { isLoggedIn, username, name };
};

export default connect(mapStateToProps)(UserSettings);
