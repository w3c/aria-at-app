import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { Button, Container, Form } from 'react-bootstrap';
import { handleSetUserAts } from '../../actions/users';

class UserSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.onCheckboxClicked = this.onCheckboxClicked.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.hydrateSelectedUserAts = this.hydrateSelectedUserAts.bind(this);
    }

    hydrateSelectedUserAts() {
        this.setState(
            Object.assign(
                {},
                ...this.props.ats
                    .map(at => {
                        let userAt = this.props.currentUserAts.filter(
                            userAt => at.id === userAt.at_name_id
                        );
                        return [
                            at.name,
                            {
                                checked: userAt.length ? true : false
                            }
                        ];
                    })
                    .map(([k, v]) => ({ [k]: v }))
            )
        );
    }

    componentDidMount() {
        this.hydrateSelectedUserAts();
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.ats !== this.props.ats ||
            prevProps.currentUserAts !== this.props.currentUserAts
        ) {
            this.hydrateSelectedUserAts();
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
        const { dispatch, ats, userId } = this.props;
        const selectedAts = Object.entries(this.state)
            .filter(atEntry => atEntry[1].checked)
            .map(atEntry => atEntry[0])
            .map(atName => ats.filter(at => at.name === atName).shift());
        dispatch(handleSetUserAts(userId, selectedAts));
        event.preventDefault();
    }

    render() {
        const { ats, isSignedIn, username, email, loadedUserData } = this.props;
        const content =
            loadedUserData && isSignedIn ? (
                <section data-test="user-settings-authorized">
                    <h2>User Details</h2>
                    <p>{username}</p>
                    <p>{email}</p>

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
                                            onChange={
                                                this.onCheckboxClicked
                                            }
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
                  </section>
            ) : (
                <p data-test="user-settings-unauthorized">Unauthorized</p>
            );

        return (
            <Fragment>
                <Container fluid data-test="user-settings-contents">
                    <Helmet>
                        <title>Settings | ARIA-AT</title>
                    </Helmet>
                    <h1>Settings</h1>
                    {content}
                </Container>
            </Fragment>
        );
    }
}

UserSettings.propTypes = {
    isSignedIn: PropTypes.bool,
    loadedUserData: PropTypes.bool,
    fullname: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    userId: PropTypes.number,
    ats: PropTypes.array,
    dispatch: PropTypes.func,
    currentUserAts: PropTypes.array
};

const mapStateToProps = state => {
    const {
        loadedUserData,
        isSignedIn,
        username,
        fullname,
        email,
        id
    } = state.user;
    const { usersById } = state.users;

    let currentUserAts = [];
    if (username && usersById[id]) {
        currentUserAts = usersById[id].configured_ats;
    }

    return {
        isSignedIn,
        loadedUserData,
        username,
        fullname,
        email,
        ats: state.ats,
        userId: id,
        currentUserAts
    };
};

export default connect(mapStateToProps)(UserSettings);
