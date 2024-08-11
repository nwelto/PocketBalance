import PropTypes from 'prop-types';
import { useAuth } from './context/authContext';
import Loading from '../components/Loading';
import Signin from '../components/Signin';
import NavBar from '../components/NavBar';
import RegisterForm from '../components/RegisterForm';

const ViewDirectorBasedOnUserAuthStatus = ({ component: Component, pageProps }) => {
  const { user, userLoading, updateUser } = useAuth();

  // If user state is null, show loading spinner
  if (userLoading) {
    return <Loading />;
  }

  // If user is logged in, determine what to render
  if (user) {
    return (
      <>
        <NavBar />
        <div className="container">
          {/* If user is not fully registered, show RegisterForm */}
          {user.valid === false ? (
            <RegisterForm user={user} updateUser={updateUser} />
          ) : (
            <Component {...pageProps} />
          )}
        </div>
      </>
    );
  }

  // If user is not logged in, show the Signin component
  return <Signin />;
};

export default ViewDirectorBasedOnUserAuthStatus;

ViewDirectorBasedOnUserAuthStatus.propTypes = {
  component: PropTypes.func.isRequired,
  pageProps: PropTypes.oneOfType([PropTypes.object]).isRequired,
};
