import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { handleGetValidAts } from '../../actions/ats';

class UserSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.onCheckboxClicked = this.onCheckboxClicked.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(handleGetValidAts());
    }

    componentDidUpdate(prevProps) {
        if (prevProps.ats !== this.props.ats) {
            this.setState(
                Object.assign(
                    {},
                    ...this.props.ats
                        .map(at => [at, { checked: false }])
                        .map(([k, v]) => ({ [k]: v }))
                )
            );
        }
    }

    onCheckboxClicked(event) {
        if (event.target) {
            const { id } = event.target;
            // Need to do this check because some SyntheticEvents have a null target
            if (id) {
                this.setState(prevState => {
                    return {
                        ...prevState,
                        [id]: {
                            checked: !prevState[id].checked
                        }
                    };
                });
            }
        }
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
                    <Form>
                        <Form.Group controlId="formBasicCheckbox">
                            {ats &&
                                ats.map(at => (
                                    <Form.Check
                                        id={at}
                                        key={at}
                                        label={at}
                                        onClick={this.onCheckboxClicked}
                                    />
                                ))}
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
    username: PropTypes.string,
    email: PropTypes.string,
    ats: PropTypes.array,
    dispatch: PropTypes.func
};

const mapStateToProps = state => {
    const { isLoggedIn, username, email } = state.login;
    const { names: atNames } = state.ats;
    return { isLoggedIn, username, email, ats: atNames };
};

export default connect(mapStateToProps)(UserSettings);
