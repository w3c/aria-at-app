import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { handleGetValidAts } from '../../actions/ats';
import { handleSetUserAts, handleGetUserAts } from '../../actions/users';

class UserSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.onCheckboxClicked = this.onCheckboxClicked.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        const { dispatch, username, fullname, email } = this.props;
        dispatch(handleGetValidAts());
        dispatch(handleGetUserAts({ username, fullname, email }));
    }

    componentDidUpdate(prevProps) {
        if (prevProps.ats !== this.props.ats) {
            this.setState(
                Object.assign(
                    {},
                    ...this.props.ats
                        .map(at => [at.name, { checked: false }])
                        .map(([k, v]) => ({ [k]: v }))
                )
            );
        }

        if (
            this.props.ats &&
            prevProps.currentUserAts !== this.props.currentUserAts
        ) {
            this.setState(
                Object.assign(
                    {},
                    ...this.props.ats
                        .map(at => [
                            at.name,
                            {
                                checked:
                                    this.props.currentUserAts.indexOf(at.id) >=
                                    0
                            }
                        ])
                        .map(([k, v]) => ({ [k]: v }))
                )
            );
        }
    }

    onCheckboxClicked(event) {
        if (event.target) {
            const { id, checked } = event.target;
            // Need to do this check because some SyntheticEvents have a null target
            if (id) {
                this.setState(prevState => {
                    return {
                        ...prevState,
                        [id]: {
                            checked
                        }
                    };
                });
            }
        }
    }

    onSubmit(event) {
        const { dispatch, username, email, fullname, ats } = this.props;
        let currentUser = { username, email, fullname };
        const selectedAts = Object.entries(this.state)
            .filter(atEntry => atEntry[1].checked)
            .map(atEntry => atEntry[0])
            .map(atName => ats.filter(at => at.name === atName).shift().id);
        dispatch(handleSetUserAts(currentUser, selectedAts));
        event.preventDefault();
    }

    render() {
        const { ats, isLoggedIn, username, email } = this.props;
        const contents = isLoggedIn ? (
            <Row data-test="user-settings-authorized">
                <Col>
                    <h2>USER DETAILS</h2>
                    <p>{username}</p>
                    <p>{email}</p>
                </Col>
                <Col>
                    <h2>Assistive Technology</h2>
                    <p>Add the assistive technologies that you can use</p>
                    <Form onSubmit={this.onSubmit}>
                        <Form.Group controlId="formBasicCheckbox">
                            {ats &&
                                ats.map(at => {
                                    return (
                                        <Form.Check
                                            id={at.name}
                                            key={at.id}
                                            label={at.name}
                                            onChange={this.onCheckboxClicked}
                                            checked={
                                                this.state[at.name]
                                                    ? this.state[at.name]
                                                          .checked
                                                    : false
                                            }
                                        />
                                    );
                                })}
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Save
                        </Button>
                    </Form>
                </Col>
            </Row>
        ) : (
            <p data-test="user-settings-unauthorized">Unauthorized</p>
        );

        return <div data-test="component-user-settings">{contents}</div>;
    }
}

UserSettings.propTypes = {
    isLoggedIn: PropTypes.bool,
    fullname: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    ats: PropTypes.array,
    dispatch: PropTypes.func,
    currentUserAts: PropTypes.array
};

const mapStateToProps = state => {
    const { isLoggedIn } = state.login;
    const {
        currentUser: { username, email, name: fullname, ats: currentUserAts }
    } = state.users;
    return {
        isLoggedIn,
        username,
        fullname,
        email,
        ats: state.ats,
        currentUserAts
    };
};

export default connect(mapStateToProps)(UserSettings);
