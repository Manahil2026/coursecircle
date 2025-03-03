import { describe, it } from "node:test";

// Importing the 'expect' assertion library from Chai
const { expect } = require('chai');

// Function that we want to test
function getDashboardUrl(role: string | null | undefined) {
  if (role === 'member') {
    return '/pages/student/dashboard';
  } else if (role === 'prof') {
    return '/pages/professor/dashboard';
  } else if (role === 'uni_admin') {
    return '/pages/admin/dashboard';
  }
  return '/';
}

// Mocha test suite for 'getDashboardUrl' function
describe('getDashboardUrl', function () {

  // Test for 'member' role
  it('should return the correct URL for member', function () {
    const result = getDashboardUrl('member');
    expect(result).to.equal('/pages/student/dashboard');
  });

  // Test for 'prof' role
  it('should return the correct URL for professor', function () {
    const result = getDashboardUrl('prof');
    expect(result).to.equal('/pages/professor/dashboard');
  });

  // Test for 'uni_admin' role
  it('should return the correct URL for uni_admin', function () {
    const result = getDashboardUrl('uni_admin');
    expect(result).to.equal('/pages/admin/dashboard');
  });

  // Test for unknown roles
  it('should return the default URL if role is unknown', function () {
    const result = getDashboardUrl('unknown');
    expect(result).to.equal('/');
  });

  // Additional edge case test for 'null' role
  it('should return the default URL if role is null', function () {
    const result = getDashboardUrl(null);
    expect(result).to.equal('/');
  });

  // Additional edge case test for 'undefined' role
  it('should return the default URL if role is undefined', function () {
    const result = getDashboardUrl(undefined);
    expect(result).to.equal('/');
  });

  // Additional edge case test for empty string as role
  it('should return the default URL if role is an empty string', function () {
    const result = getDashboardUrl('');
    expect(result).to.equal('/');
  });

});
