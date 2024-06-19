import Header from './components/Header/Header';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import { doGetAccount } from './redux/action/accountAction';
import HashLoader from 'react-spinners/HashLoader';
import { Outlet } from 'react-router-dom';

const App = () => {
	const dispatch = useDispatch();
	const user = useSelector((state) => state.account.userInfo);
	const isLoading = useSelector((state) => state.account.isLoading);

	const firstRenderRef = useRef(true);

	useEffect(() => {
		if (user && !user.access_token) {
			dispatch(doGetAccount());
		}
		firstRenderRef.current = false;
	}, []);

	const style = {
		position: 'fixed',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)'
	};
	return (
		<>
			{isLoading === true ? (
				<div style={style}>
					<HashLoader color={'#36d7b7'} loading={true} size={50} />
				</div>
			) : (
				<>
					{firstRenderRef.current === false && (
						<div className='App'>
							<Header />
							<Outlet />
						</div>
					)}
				</>
			)}
		</>
	);
};

export default App;
