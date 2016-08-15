import React from 'react';

import { Navbar, Nav, NavItem, Grid, Row, Modal, Glyphicon } from 'react-bootstrap';

import Dashboard from './dashboard';
import ServerSettings from './serversettings';

import actions from './actions';

const CrackedCobble = React.createClass({
    displayName: 'CrackedCobble',
    propTypes: {
        dispatch: React.PropTypes.func.isRequired,
        system: React.PropTypes.object.isRequired,
        servers: React.PropTypes.array.isRequired,
        isNetworkActive: React.PropTypes.bool.isRequired,
        serverEdit: React.PropTypes.object.isRequired
    },
    componentDidMount() {
        const { dispatch } = this.props;

        dispatch(actions.refreshSystem());
        dispatch(actions.refreshServers());

        const ws = window.io();
        ws.on('systemStatus', (status) => {
            return dispatch({ type: 'SYSTEM_STATUS_RECEIVED', status });
        });
        ws.on('serverStatusChange', (server) => {
            return dispatch({ type: 'SERVER_STATUS_RECEIVED', server });
        });
        ws.on('serverAdded', () => {
            return dispatch(actions.refreshServers());
        });
        // FIXME - do something useful with this
        ws.on('newMinecraftVersion', (version) => {
            console.log(`New minecraft version available: ${version}`);
        });
    },
    componentWillUnmount() {
        clearInterval(this.systemStatusInterval);
        clearInterval(this.serverStatusInterval);
        this.systemStatusInterval = null;
        this.serverStatusInterval = null;
    },
    onCreate(evt) {
        evt.preventDefault();
        this.props.dispatch(actions.requestMinecraftVersions());
        this.props.dispatch({ type: 'SHOW_SERVER_CREATE' });
    },
    cancelCreate() {
        this.props.dispatch({ type: 'CANCEL_SERVER_CREATE' });
    },
    onServerStart(serverId) {
        this.props.dispatch(actions.startServer(serverId));
    },
    onServerStop(serverId) {
        this.props.dispatch(actions.stopServer(serverId));
    },
    onCreateServer(server) {
        console.log('creating server...');
        console.log(server);
        this.props.dispatch(actions.createServer(server));
    },
    render() {
        const { isNetworkActive, serverEdit, system, servers } = this.props;
        return (
            <Grid fluid>
                <Row style={ { marginTop: 65 } }>
                    <Navbar fluid fixedTop>
                        <Navbar.Header className="nav-xs-left">
                            <Navbar.Brand>CrackedCobble</Navbar.Brand>
                        </Navbar.Header>
                        <Nav pullRight className="nav-xs-right">
                            <NavItem eventKey={ 1 } href="#" onClick={ this.onCreate }>
                                <Glyphicon glyph="plus" />
                            </NavItem>
                        </Nav>
                    </Navbar>
                </Row>
                <Row>
                    <Dashboard
                        status={ system.status }
                        servers={ servers }
                        onServerStart={ this.onServerStart }
                        onServerStop={ this.onServerStop }
                    />
                </Row>
                <Modal show={ serverEdit.active } onHide={ this.cancelCreate } dialogClassName="wide-modal">
                    <Modal.Header closeButton>
                        <Modal.Title>Create Server...</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ServerSettings
                            isNetworkActive={ isNetworkActive }
                            serverEdit= { serverEdit }
                            onClose={ this.cancelCreate }
                            onCreate={ this.onCreateServer }
                        />
                    </Modal.Body>
                </Modal>
            </Grid>
        );
    }
});

export default CrackedCobble;