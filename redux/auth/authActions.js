import { loginUser, registerUser, logoutUserAPI } from "../../api/authApi"
import * as types from "./authTypes"
import { apiCallError } from "../apiStatus/apiActions"
import { loadUserProfile } from "../profile/profileActions"
import Router from "next/router"

export const authStart = () => {
  return { type: types.AUTH_START }
}

export const authSuccess = (token) => {
  return { type: types.AUTH_SUCCESS, payload: token }
}

export const authFail = (error, response) => {
  return {
    type: types.AUTH_FAIL,
    payload: { error, response },
  }
}

export const authLogoutAction = () => {
  return {
    type: types.AUTH_LOGOUT,
  }
}

export const logout = () => {
  return function (dispatch) {
    dispatch(authStart())
    return logoutUserAPI()
      .then((res) => {
        localStorage.removeItem("token")
        localStorage.removeItem("expirationDate")
        localStorage.removeItem("email")
        localStorage.removeItem("user_id")

        dispatch(authLogoutAction())

        const register_link = process.env.WEB_APP_URL + "register"
        // if (window.location.href !== register_link) {
        // }

        if (
          window.location.href !== process.env.WEB_APP_URL &&
          window.location.href !== register_link
        ) {
          Router.push("/login")
        }
      })
      .catch((error) => {
        const error_msg = error.error_msg || error.message

        // dispatch(apiCallError(error))
        dispatch(authFail(true, error_msg))
        // throw error
      })
  }
}

export const authLogin = (email, password) => {
  return function (dispatch) {
    dispatch(authStart())
    return loginUser(email, password)
      .then((res) => {
        const token = res.data.key
        const expirationDate = new Date(new Date().getTime() + 3600 * 1000)
        localStorage.setItem("token", token)
        localStorage.setItem("expirationDate", expirationDate)
        localStorage.setItem("email", email)
        dispatch(authSuccess(token, email))
        const auth = true
        dispatch(loadUserProfile(auth))
        Router.push("/profiles")
      })
      .catch((error) => {
        const error_msg = error.error_msg || error.message
        // dispatch(apiCallError(error))
        dispatch(authFail(true, error_msg))
        // throw error
      })
  }
}

export const authRegister = (
  first_name,
  last_name,
  email,
  password1,
  password2
) => {
  return function (dispatch) {
    dispatch(authStart())
    console.log({ first_name, last_name, email, password1, password2 })

    return registerUser(first_name, last_name, email, password1, password2)
      .then((res) => {
        const token = res.data.key
        const expirationDate = new Date(new Date().getTime() + 3600 * 1000)
        localStorage.setItem("token", token)
        localStorage.setItem("expirationDate", expirationDate)
        // localStorage.setItem("email", email)
        dispatch(authSuccess(token))
        const auth = true
        dispatch(loadUserProfile(auth))
        Router.push("/edit-profile")
      })
      .catch((error) => {
        // console.log(error)
        // dispatch(apiCallError(error))
        dispatch(authFail(true, error.error_msg))
        // throw error
      })
  }
}

export const checkAuthTimeout = (expirationTime) => {
  return (dispatch) => {
    setTimeout(() => {
      dispatch(logout())
    }, expirationTime * 1000)
  }
}

export const authCheckState = () => {
  return (dispatch) => {
    const token = localStorage.getItem("token")
    const user_id = localStorage.getItem("user_id")

    if (token === undefined) {
      dispatch(logout())
    } else {
      const expirationDate = new Date(localStorage.getItem("expirationDate"))
      if (expirationDate <= new Date()) {
        dispatch(logout())
      } else {
        dispatch(authSuccess(token))
        if (user_id === undefined) {
          const auth = true
          dispatch(loadUserProfile(auth))
        }
        dispatch(
          checkAuthTimeout(
            (expirationDate.getTime() - new Date().getTime()) / 1000
          )
        )
      }
    }
  }
}
