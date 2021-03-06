/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015-2016, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

/*eslint-env mocha*/

import _ from 'lodash';
import mutationTracker from 'object-invariant-test-helper';
import { expect } from 'chai';

import * as actionTypes from '../../../app/constants/actionTypes';
import { pages } from '../../../app/constants/otherConstants';
import * as misc from '../../../app/reducers/misc';

import devices from '../../../app/reducers/devices';

import { UnsupportedError } from '../../../app/utils/errors';

describe('misc reducers', () => {
  describe('devices', () => {
    function filterDevicesFn(os) {
      return function(device) {
        if (device.enabled[os] === true) {
          return true;
        }
        return false;
      };
    }
    it('should return the initial state', () => {
      expect(misc.devices(undefined, {})).to.deep.equal(devices);
    });

    it('should handle HIDE_UNAVAILABLE_DEVICES [mac]', () => {
      let actualResult = misc.devices(undefined, {
        type: actionTypes.HIDE_UNAVAILABLE_DEVICES,
        payload: {os: 'mac'}
      });
      let expectedResult = _.pickBy(devices, filterDevicesFn('mac'));
      expect(actualResult).to.deep.equal(expectedResult);
      // test to be sure not *mutating* state object but rather returning new!
      let prevState = devices;
      const tracked = mutationTracker.trackObj(prevState);
      misc.devices(prevState, {
        type: actionTypes.HIDE_UNAVAILABLE_DEVICES,
        payload: {os: 'mac'}
      });
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
      // at least one device is unavailable on Mac, so available devices should be less than
      // all devices
      expect(_.keys(actualResult).length).to.be.lessThan(_.keys(devices).length);
    });

    it('should handle HIDE_UNAVAILABLE_DEVICES [win]', () => {
      let actualResult = misc.devices(undefined, {
        type: actionTypes.HIDE_UNAVAILABLE_DEVICES,
        payload: {os: 'win'}
      });
      let expectedResult = _.pickBy(devices, filterDevicesFn('win'));
      expect(actualResult).to.deep.equal(expectedResult);
      // at least one device is unavailable on Windows, so available devices should be less than
      // all devices
      expect(_.keys(actualResult).length).to.be.lessThan(_.keys(devices).length);
      // test to be sure not *mutating* state object but rather returning new!
      let prevState = devices;
      const tracked = mutationTracker.trackObj(prevState);
      misc.devices(prevState, {
        type: actionTypes.HIDE_UNAVAILABLE_DEVICES,
        payload: {os: 'win'}
      });
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('dropdown', () => {
    it('should return the initial state', () => {
      expect(misc.dropdown(undefined, {})).to.be.false;
    });

    it('should handle TOGGLE_DROPDOWN', () => {
      expect(misc.dropdown(undefined, {
        type: actionTypes.TOGGLE_DROPDOWN,
        payload: {isVisible: true}
      })).to.be.true;
      expect(misc.dropdown(undefined, {
        type: actionTypes.TOGGLE_DROPDOWN,
        payload: {isVisible: false}
      })).to.be.false;
    });

    it('should handle LOGOUT_REQUEST', () => {
      expect(misc.dropdown(undefined, {
        type: actionTypes.LOGOUT_REQUEST
      })).to.be.false;
      expect(misc.dropdown(true, {
        type: actionTypes.LOGOUT_REQUEST
      })).to.be.false;
      expect(misc.dropdown(false, {
        type: actionTypes.LOGOUT_REQUEST
      })).to.be.false;
    });
  });

  describe('os', () => {
    it('should return the initial state', () => {
      expect(misc.os(undefined, {})).to.be.null;
    });

    it('should handle SET_OS', () => {
      expect(misc.os(undefined, {
        type: actionTypes.SET_OS,
        payload: {os: 'test'}
      })).to.equal('test');
    });
  });

  describe('unsupported', () => {
    it('should return the initial state', () => {
      expect(misc.unsupported(undefined, {})).to.be.true;
    });

    it('should handle INIT_APP_FAILURE', () => {
      const err = new Error('Offline!');
      expect(misc.unsupported(undefined, {
        type: actionTypes.INIT_APP_FAILURE,
        error: true,
        payload: err
      })).to.deep.equal(err);
    });

    it('should handle VERSION_CHECK_FAILURE [API error]', () => {
      const err = new Error('API error!');
      expect(misc.unsupported(undefined, {
        type: actionTypes.VERSION_CHECK_FAILURE,
        error: true,
        payload: err
      })).to.deep.equal(err);
    });

    it('should handle VERSION_CHECK_FAILURE [uploader version doesn\'t meet minimum]', () => {
      const currentVersion = '0.99.0', requiredVersion = '0.100.0';
      const err = new UnsupportedError(currentVersion, requiredVersion);
      expect(misc.unsupported(undefined, {
        type: actionTypes.VERSION_CHECK_FAILURE,
        error: true,
        payload: err
      })).to.be.true;
    });

    it('should handle VERSION_CHECK_SUCCESS', () => {
      expect(misc.unsupported(undefined, {
        type: actionTypes.VERSION_CHECK_SUCCESS
      })).to.be.false;
    });
  });

  describe('blipUrls', () => {
    it('should return the initial state', () => {
      expect(misc.blipUrls(undefined, {})).to.deep.equal({});
    });

    it('should handle SET_BLIP_VIEW_DATA_URL', () => {
      const VIEW_DATA_LINK = 'http://www.acme.com/patients/a1b2c3/data';
      const actionPayload = {url: VIEW_DATA_LINK};
      expect(misc.blipUrls(undefined, {
        type: actionTypes.SET_BLIP_VIEW_DATA_URL,
        payload: actionPayload
      }).viewDataLink).to.equal(VIEW_DATA_LINK);
      // test to be sure not *mutating* state object but rather returning new!
      let initialState = {};
      const tracked = mutationTracker.trackObj(initialState);
      misc.blipUrls(initialState, {
        type: actionTypes.SET_BLIP_VIEW_DATA_URL,
        payload: actionPayload
      });
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should handle SET_FORGOT_PASSWORD_URL', () => {
      const FORGOT_PWD = 'http://www.acme.com/forgot-password';
      const actionPayload = {url: FORGOT_PWD};
      expect(misc.blipUrls(undefined, {
        type: actionTypes.SET_FORGOT_PASSWORD_URL,
        payload: actionPayload
      }).forgotPassword).to.equal(FORGOT_PWD);
      // test to be sure not *mutating* state object but rather returning new!
      let initialState = {};
      const tracked = mutationTracker.trackObj(initialState);
      misc.blipUrls(initialState, {
        type: actionTypes.SET_FORGOT_PASSWORD_URL,
        payload: actionPayload
      });
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should handle SET_SIGNUP_URL', () => {
      const SIGN_UP = 'http://www.acme.com/sign-up';
      const actionPayload = {url: SIGN_UP};
      expect(misc.blipUrls(undefined, {
        type: actionTypes.SET_SIGNUP_URL,
        payload: actionPayload
      }).signUp).to.equal(SIGN_UP);
      // test to be sure not *mutating* state object but rather returning new!
      let initialState = {};
      const tracked = mutationTracker.trackObj(initialState);
      misc.blipUrls(initialState, {
        type: actionTypes.SET_SIGNUP_URL,
        payload: actionPayload
      });
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should handle SET_NEW_PATIENT_URL', () => {
      const NEW_PATIENT = 'http://www.acme.com/patients/new';
      const actionPayload = {url: NEW_PATIENT};
      expect(misc.blipUrls(undefined, {
        type: actionTypes.SET_NEW_PATIENT_URL,
        payload: actionPayload
      }).newPatient).to.equal(NEW_PATIENT);
      // test to be sure not *mutating* state object but rather returning new!
      let initialState = {};
      const tracked = mutationTracker.trackObj(initialState);
      misc.blipUrls(initialState, {
        type: actionTypes.SET_NEW_PATIENT_URL,
        payload: actionPayload
      });
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('working', () => {
    it('should return the initial state', () => {
      expect(misc.working(undefined, {})).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle INIT_APP_FAILURE', () => {
      expect(misc.working(undefined, {
        type: actionTypes.INIT_APP_FAILURE
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: false,
        uploading: false
      });
    });

    it('should handle INIT_APP_REQUEST', () => {
      expect(misc.working(undefined, {
        type: actionTypes.INIT_APP_REQUEST
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle INIT_APP_SUCCESS', () => {
      expect(misc.working(undefined, {
        type: actionTypes.INIT_APP_SUCCESS
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: false,
        uploading: false
      });
    });

    it('should handle LOGIN_FAILURE', () => {
      expect(misc.working(undefined, {
        type: actionTypes.LOGIN_FAILURE
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle LOGIN_REQUEST', () => {
      expect(misc.working(undefined, {
        type: actionTypes.LOGIN_REQUEST
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: true,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle LOGIN_SUCCESS', () => {
      expect(misc.working(undefined, {
        type: actionTypes.LOGIN_SUCCESS
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle READ_FILE_ABORTED', () => {
      expect(misc.working(undefined, {
        type: actionTypes.READ_FILE_ABORTED
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle READ_FILE_FAILURE', () => {
      expect(misc.working(undefined, {
        type: actionTypes.READ_FILE_FAILURE
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle VERSION_CHECK_FAILURE', () => {
      expect(misc.working(undefined, {
        type: actionTypes.VERSION_CHECK_FAILURE
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle VERSION_CHECK_REQUEST', () => {
      expect(misc.working(undefined, {
        type: actionTypes.VERSION_CHECK_REQUEST
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: true,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle VERSION_CHECK_SUCCESS', () => {
      expect(misc.working(undefined, {
        type: actionTypes.VERSION_CHECK_SUCCESS
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle UPLOAD_FAILURE', () => {
      expect(misc.working(undefined, {
        type: actionTypes.UPLOAD_FAILURE
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle UPLOAD_REQUEST', () => {
      expect(misc.working(undefined, {
        type: actionTypes.UPLOAD_REQUEST
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: true
      });
    });

    it('should handle UPLOAD_SUCCESS', () => {
      expect(misc.working(undefined, {
        type: actionTypes.UPLOAD_SUCCESS
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle CHECKING_FOR_UPDATES', () => {
      expect(misc.working(undefined, {
        type: actionTypes.CHECKING_FOR_UPDATES
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: true,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle UPDATE_AVAILABLE', () => {
      expect(misc.working(undefined, {
        type: actionTypes.UPDATE_AVAILABLE
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle UPDATE_NOT_AVAILABLE', () => {
      expect(misc.working(undefined, {
        type: actionTypes.UPDATE_NOT_AVAILABLE
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle AUTOUPDATE_ERROR', () => {
      expect(misc.working(undefined, {
        type: actionTypes.AUTOUPDATE_ERROR
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle CHECKING_FOR_DRIVER_UPDATE', () => {
      expect(misc.working(undefined, {
        type: actionTypes.CHECKING_FOR_DRIVER_UPDATE
      })).to.deep.equal({
        checkingDriverUpdate: true,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle DRIVER_UPDATE_AVAILABLE', () => {
      expect(misc.working(undefined, {
        type: actionTypes.DRIVER_UPDATE_AVAILABLE
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

    it('should handle DRIVER_UPDATE_NOT_AVAILABLE', () => {
      expect(misc.working(undefined, {
        type: actionTypes.DRIVER_UPDATE_NOT_AVAILABLE
      })).to.deep.equal({
        checkingDriverUpdate: false,
        checkingElectronUpdate: false,
        checkingVersion: false,
        fetchingUserInfo: false,
        initializingApp: true,
        uploading: false
      });
    });

  });

  describe('electronUpdateManualChecked', () => {
    it('should return the initial state', () => {
      expect(misc.electronUpdateManualChecked(undefined, {})).to.be.null;
    });

    it('should handle MANUAL_UPDATE_CHECKING_FOR_UPDATES', () => {
      expect(misc.electronUpdateManualChecked(undefined, {
        type: actionTypes.MANUAL_UPDATE_CHECKING_FOR_UPDATES
      })).to.be.true;
    });

    it('should handle DISMISS_UPDATE_NOT_AVAILABLE', () => {
      expect(misc.electronUpdateManualChecked(undefined, {
        type: actionTypes.DISMISS_UPDATE_NOT_AVAILABLE
      })).to.be.null;
    });
  });

  describe('electronUpdateAvailableDismissed', () => {
    it('should return the initial state', () => {
      expect(misc.electronUpdateAvailableDismissed(undefined, {})).to.be.null;
    });

    it('should handle MANUAL_UPDATE_CHECKING_FOR_UPDATES', () => {
      expect(misc.electronUpdateAvailableDismissed(undefined, {
        type: actionTypes.MANUAL_UPDATE_CHECKING_FOR_UPDATES
      })).to.be.null;
    });

    it('should handle DISMISS_UPDATE_AVAILABLE', () => {
      expect(misc.electronUpdateAvailableDismissed(undefined, {
        type: actionTypes.DISMISS_UPDATE_AVAILABLE
      })).to.be.true;
    });
  });

  describe('electronUpdateAvailable', () => {
    it('should return the initial state', () => {
      expect(misc.electronUpdateAvailable(undefined, {})).to.be.null;
    });

    it('should handle AUTO_UPDATE_CHECKING_FOR_UPDATES', () => {
      expect(misc.electronUpdateAvailable(undefined, {
        type: actionTypes.AUTO_UPDATE_CHECKING_FOR_UPDATES
      })).to.be.null;
    });

    it('should handle MANUAL_UPDATE_CHECKING_FOR_UPDATES', () => {
      expect(misc.electronUpdateAvailable(undefined, {
        type: actionTypes.MANUAL_UPDATE_CHECKING_FOR_UPDATES
      })).to.be.null;
    });

    it('should handle UPDATE_AVAILABLE', () => {
      expect(misc.electronUpdateAvailable(undefined, {
        type: actionTypes.UPDATE_AVAILABLE
      })).to.be.true;
    });

    it('should handle UPDATE_NOT_AVAILABLE', () => {
      expect(misc.electronUpdateAvailable(undefined, {
        type: actionTypes.UPDATE_NOT_AVAILABLE
      })).to.be.false;
    });
  });

  describe('electronUpdateDownloaded', () => {
    it('should return the initial state', () => {
      expect(misc.electronUpdateDownloaded(undefined, {})).to.be.null;
    });

    it('should handle UPDATE_AVAILABLE', () => {
      expect(misc.electronUpdateDownloaded(undefined, {
        type: actionTypes.UPDATE_AVAILABLE
      })).to.be.null;
    });

    it('should handle UPDATE_DOWNLOADED', () => {
      expect(misc.electronUpdateDownloaded(undefined, {
        type: actionTypes.UPDATE_DOWNLOADED
      })).to.be.true;
    });

    it('should handle AUTOUPDATE_ERROR', () => {
      expect(misc.electronUpdateDownloaded(undefined, {
        type: actionTypes.AUTOUPDATE_ERROR
      })).to.be.false;
    });
  });

  describe('driverUpdateAvailable', () => {
    it('should return the initial state', () => {
      expect(misc.driverUpdateAvailable(undefined, {})).to.be.null;
    });

    it('should handle DRIVER_UPDATE_AVAILABLE', () => {
      const payload = {'example':'info'};
      expect(misc.driverUpdateAvailable(undefined, {
        type: actionTypes.DRIVER_UPDATE_AVAILABLE,
        payload
      })).to.deep.equal(payload);
    });

    it('should handle DRIVER_UPDATE_NOT_AVAILABLE', () => {
      expect(misc.driverUpdateAvailable(undefined, {
        type: actionTypes.DRIVER_UPDATE_NOT_AVAILABLE
      })).to.be.false;
    });

    it('should handle DRIVER_INSTALL', () => {
      expect(misc.driverUpdateAvailable(undefined, {
        type: actionTypes.DRIVER_INSTALL
      })).to.be.false;
    });
  });

  describe('driverUpdateAvailableDismissed', () => {
    it('should return the initial state', () => {
      expect(misc.driverUpdateAvailableDismissed(undefined, {})).to.be.null;
    });

    it('should handle CHECKING_FOR_DRIVER_UPDATE', () => {
      expect(misc.driverUpdateAvailableDismissed(undefined, {
        type: actionTypes.CHECKING_FOR_DRIVER_UPDATE
      })).to.be.false;
    });

    it('should handle DISMISS_DRIVER_UPDATE_AVAILABLE', () => {
      expect(misc.driverUpdateAvailableDismissed(undefined, {
        type: actionTypes.DISMISS_DRIVER_UPDATE_AVAILABLE
      })).to.be.true;
    });
  });

  describe('driverUpdateShellOpts', () => {
    it('should return the initial state', () => {
      expect(misc.driverUpdateShellOpts(undefined, {})).to.be.null;
    });

    it('should handle DRIVER_INSTALL_SHELL_OPTS', () => {
      const payload = {'example':'info'};
      expect(misc.driverUpdateShellOpts(undefined, {
        type: actionTypes.DRIVER_INSTALL_SHELL_OPTS,
        payload
      })).to.deep.equal(payload);
    });
  });

  describe('driverUpdateComplete', () => {
    it('should return the initial state', () => {
      expect(misc.driverUpdateComplete(undefined, {})).to.be.null;
    });

    it('should handle DRIVER_INSTALL', () => {
      expect(misc.driverUpdateComplete(undefined, {
        type: actionTypes.DRIVER_INSTALL
      })).to.be.true;
    });
  });

  describe('showingDeviceTimePrompt', () => {
    it('should return the initial state', () => {
      expect(misc.showingDeviceTimePrompt(undefined, {})).to.be.null;
    });

    it('should handle DEVICE_TIME_INCORRECT', () => {
      const payload = { callback: () => { }, cfg: { conf: 'value' }, times: { time1: 'value1' }};
      expect(misc.showingDeviceTimePrompt(undefined, {
        type: actionTypes.DEVICE_TIME_INCORRECT,
        payload
      })).to.deep.equal(payload);
    });

    it('should handle DISMISS_DEVICE_TIME_PROMPT', () => {
      expect(misc.showingDeviceTimePrompt(undefined, {
        type: actionTypes.DISMISS_DEVICE_TIME_PROMPT,
      })).to.be.false;
    });
  });

  describe('isTimezoneFocused', () => {
    it('should return the initial state', () => {
      expect(misc.isTimezoneFocused(undefined, {})).to.be.false;
    });

    it('should handle UPLOAD_CANCELLED', () => {
      expect(misc.isTimezoneFocused(undefined, {
        type: actionTypes.UPLOAD_CANCELLED,
      })).to.be.true;
    });

    it('should handle TIMEZONE_BLUR', () => {
      expect(misc.isTimezoneFocused(undefined, {
        type: actionTypes.TIMEZONE_BLUR,
      })).to.be.false;
    });

    it('should handle UPLOAD_REQUEST', () => {
      expect(misc.isTimezoneFocused(undefined, {
        type: actionTypes.UPLOAD_REQUEST,
      })).to.be.false;
    });
  });
});
