import React from 'react';
import {Tab, Tabs} from 'react-toolbox';

//host
import Host from './components/host';

class App extends React.Component {
    state = {
        index: 0
    };

    handleTabChange = (index) => {
        this.setState({index});
    };

    handleActive = () => {
        console.log('Special one activated');
    };

    render () {
        return (
        <Tabs index={this.state.index} onChange={this.handleTabChange}>
            <Tab label='Host'><small><Host /></small></Tab>
            <Tab label='Apache' onActive={this.handleActive}><small>Secondary content</small></Tab>
            <Tab label='DNS'><small>Disabled content</small></Tab>
            <Tab label='Proxy'><small>Fourth content hidden</small></Tab>
        </Tabs>
        );
    }
}

export default App;