import { useState } from 'react';
import WeatherState from './WeatherState';

const About = () => {
	const [cityState, setCityState] = useState('1236594');

	const handleSelect = (event) => {
		setCityState(event.target.value);
	};

	return (
		<>
			<div className='mx-5'>
				<select onChange={(event) => handleSelect(event)} value={cityState}>
					<option value='1236594'>Ha Noi</option>
					<option value='1252431'>Ho Chi Minh</option>
				</select>
			</div>

			<WeatherState cityState={cityState} />
		</>
	);
};

export default About;
