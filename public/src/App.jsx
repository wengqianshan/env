import React from 'react';
import {Tab, Tabs} from 'react-toolbox';

class App extends React.Component {
	

	reander () {
		return (
			<Tabs>
				<Tab label='Host'></Tab>
				<Tab label='Apache'></Tab>
				<Tab label='DNS'></Tab>
				<Tab label='Proxy'></Tab>
			</Tabs>
		)
	}
}

export default App;