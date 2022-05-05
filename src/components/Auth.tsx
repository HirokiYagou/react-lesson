import React, { useState } from 'react';
import styles from './Auth.module.css';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '../features/userSlice';
import { auth, provider, storage } from '../firebase';

import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    Modal,
    Paper,
    Box,
    Grid,
    Typography,
    IconButton
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import CameraIcon from '@mui/icons-material/Camera';
import EmailIcon from '@mui/icons-material/Email';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function getModalStyle() {
    const top = 50;
    const left = 50;
    
    return {
        position: 'absolute',
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
        outline: 'none',
        width: 400,
        backgroundColor: 'white',
        padding: 2,
    };
}

const SignInSide: React.FC = () => {
    const dispatch = useDispatch();
    
    const theme = createTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [avatarImage, setAvatarImage] = useState<File | null>(null);
    const [isLogin, setIsLogin] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const sendResetEmail = async (e: React.MouseEvent<HTMLElement>) => {
        await auth
            .sendPasswordResetEmail(resetEmail)
            .then(() => {
                setOpenModal(false);
                setResetEmail('');
            })
            .catch((err) => {
                setResetEmail('');
                throw new Error(err);
            })
    };
    const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files![0]){
            setAvatarImage(e.target.files![0]);
            e.target.value = '';
        }
    };
    const authenticateEmail = async () => {
        if(isLogin){
            try {
                await signInEmail();
            } catch(e: any) {
                setErrorMsg(e.message);
            }
        } else {
            try {
                await signUpEmail();
            } catch(e: any) {
                setErrorMsg(e.message);
            }
        }
    };
    const signInEmail = async () => {
        await auth.signInWithEmailAndPassword(email, password);
    };
    const signUpEmail = async () => {
        const authUser = await auth.createUserWithEmailAndPassword(email, password);
        let url = '';
        if(avatarImage){
            const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const N = 16;
            const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
                .map(n => S[n % S.length])
                .join('');
            const filename = randomChar + '_' + avatarImage.name;

            await storage.ref(`avatars/${filename}`).put(avatarImage);
            url = await storage.ref('avatars').child(filename).getDownloadURL();
        };
        await authUser.user?.updateProfile({
            displayName: username,
            photoURL: url,
        });
        dispatch(
            updateUserProfile({
                displayName: username,
                photoUrl: url,
            })
        );
    };
    const signInGoogle = async () => {
        await auth.signInWithPopup(provider).catch((err) => alert(err.message));
    };

    return (
        <ThemeProvider theme={theme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                item
                xs={false}
                sm={4}
                md={7}
                sx={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1649453376609-6ccce801f07b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80)',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) =>
                    t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                        my: 8,
                        mx: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            { isLogin ? 'Sign in' : 'Sign up' }
                        </Typography>
                        {errorMsg && (
                            <p className={styles.login_errorMsg}>{errorMsg}</p>
                        )}
                        <Box component="form" noValidate sx={{ mt: 1 }}>
                            {!isLogin && <>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    name="username"
                                    autoComplete="username"
                                    value={username}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setUsername(e.target.value)}
                                />
                                <Box textAlign="center">
                                    <IconButton>
                                        <label>
                                            <AccountCircleIcon
                                                fontSize='large'
                                                className={
                                                    avatarImage
                                                        ? styles.login_addIconLoaded
                                                        : styles.login_addIcon
                                                }
                                            />
                                            <input
                                                type="file"
                                                className={styles.login_hiddenIcon}
                                                onChange={onChangeImageHandler}
                                            />
                                        </label>
                                    </IconButton>
                                </Box>
                            </>}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setEmail(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPassword(e.target.value)}
                            />
                            <Button
                                disabled={
                                    isLogin
                                        ? !email || password.length < 6
                                        : !username || !email || password.length < 6 || !avatarImage
                                }
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                startIcon={<EmailIcon />}
                                onClick={authenticateEmail}
                            >
                                { isLogin ? 'Sign in' : 'Sign up' }
                            </Button>
                            <Grid container>
                                <Grid item xs>
                                    <span
                                        className={styles.login_reset}
                                        onClick={()=>setOpenModal(true)}
                                    >
                                        Forgot Password?
                                    </span>
                                </Grid>
                                <Grid item>
                                    <span
                                        className={styles.login_toggleMode}
                                        onClick={()=>setIsLogin(!isLogin)}
                                    >
                                        {isLogin ? 'Create new account?' : 'Back to login'}
                                    </span>
                                </Grid>
                            </Grid>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<CameraIcon/>}
                                sx={{ mt: 3, mb: 2 }}
                                onClick={signInGoogle}
                            >
                                Sign In with Google
                            </Button>
                        </Box>
                        <Modal
                            open={openModal}
                            onClose={()=>setOpenModal(false)}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                        >
                            <Box sx={getModalStyle()}>
                                <Grid container>
                                    <Grid item xs>
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            name="email"
                                            label="Reset email"
                                            type="email"
                                            id="resetEmail"
                                            autoComplete="email"
                                            value={resetEmail}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setResetEmail(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <IconButton onClick={sendResetEmail} className={styles.reset_email_button}>
                                            <SendIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Modal>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}
export default SignInSide;