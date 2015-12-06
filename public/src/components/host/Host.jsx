import React from 'react';
import {Input, Button} from 'react-toolbox';
import style from './style';

class Host extends React.Component {
	state = {
		multiline: true
	};

	handleTabChange = (index) => {
		this.setState({index});
	};

	handleActive = () => {
		console.log('Special one activated');
	};

	render () {
		return (
		<div>
			<Input className={style.textarea} multiline={this.state.multiline}/>
			<Button label='读取' mini={true} raised />
			<Button label='写入' icon='add'  primary raised />
		</div>
		);
	}
}

export default Host;