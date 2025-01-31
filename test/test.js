'use strict';

const expect = require('chai').expect;
const dirtree = require('../lib/directory-tree');
const testTree = require('./fixture.js');
const testTreeZeroDepth = require('./depth/fixtureZeroDepth.js');
const testTreeFirstDepth = require('./depth/fixtureFirstDepth.js');
const testTreeSecondDepth = require('./depth/fixtureSecondDepth.js');
const excludeTree = require('./fixtureExclude');
const excludeTree2 = require('./fixtureMultipleExclude');
const symlinkTree = require('./fixtureSymlink');


describe('directoryTree', () => {

  it('should not crash with empty options', () => {
    const tree = dirtree('./test/test_data');
  });

  it('should return an Object', () => {
    const tree = dirtree('./test/test_data', {extensions:/\.txt$/, followSymlinks: false });
    expect(tree).to.be.an('object');
  });

  it('should list the _children in a directory', () => {
    const tree = dirtree('./test/test_data', {extensions:/\.txt$/, followSymlinks: false });

    // 4 including the empty `some_dir_2`.
    expect(tree._children.length).to.equal(4);
  });

  it('should execute a callback function for each file with no specified extensions', () => {
    let number_of_files =  7;
    let callback_executed_times = 0;

    const tree = dirtree('./test/test_data', { followSymlinks: false }, function(item, PATH) {
      callback_executed_times++;
    });

    expect(callback_executed_times).to.equal(number_of_files);
  });

  it('should execute a callback function for each directory', () => {
    let number_of_directories = 4;
    let callback_executed_times = 0;

    const tree = dirtree('./test/test_data', { followSymlinks: false }, null, function(item, PATH) {
      callback_executed_times++;
    });

    expect(callback_executed_times).to.equal(number_of_directories);
  });

  it('should execute a callback function for each file with specified extensions', () => {
    let number_of_files =  6;
    let callback_executed_times = 0;

    const tree = dirtree('./test/test_data', {extensions:/\.txt$/, followSymlinks: false }, function(item, PATH) {
      callback_executed_times++;
    });
    expect(callback_executed_times).to.equal(number_of_files);
  });

  it('should display the size of a directory (summing up the _children)', () => {
    const tree = dirtree('./test/test_data', {extensions:/\.txt$/, attributes: ['size']});
    expect(tree.size).to.be.above(11000);
  });

  it('should not crash with directories where the user does not have necessary permissions', () => {
    const tree = dirtree('/root/', {extensions:/\.txt$/});
    expect(tree).to.equal(null);
  });

  it('should return the correct exact result', () => {
    const tree = dirtree('./test/test_data', {normalizePath: true, followSymlinks: false, attributes: ['size','type','extension'] });
    expect(tree).to.deep.equal(testTree);
  });

  it('should not swallow exceptions thrown in the callback function', () => {
    const error = new Error('Something happened!');
    const badFunction = function () {
      dirtree('./test/test_data', {extensions:/\.txt$/}, function(item) {
        throw error;
      });
    }
    expect(badFunction).to.throw(error);
  })

  it('should exclude the correct folders', () => {
    const tree = dirtree('./test/test_data',{exclude: /another_dir/, normalizePath: true, followSymlinks: false, attributes: ['size','type','extension']});
    expect(tree).to.deep.equal(excludeTree);
  });

  it('should exclude multiple folders', () => {
    const tree = dirtree('./test/test_data', {exclude: [/another_dir/, /some_dir_2/], normalizePath: true, followSymlinks: false, attributes: ['size','type','extension']});
    expect(tree).to.deep.equal(excludeTree2);

  });

  it('should include attributes', () => {
    const tree = dirtree('./test/test_data',{ attributes: ['mtime', 'ctime'], followSymlinks: false});
    tree._children.forEach((child) => {
      if(child.type == 'file'){
        expect(child).to.have.property('mtime')
        expect(child).to.have.property('ctime')
      }
    })
  });

  it('should follow symlinks', () => {
    const tree = dirtree('./test/test_data', {normalizePath: true, followSymlinks: true, attributes: ['size','type','extension'] });
    expect(tree).to.deep.equal(symlinkTree);
  })

  it('should respect "depth = 0" argument', () => {
    const tree = dirtree('./test/test_data', {depth: 0, normalizePath: true, followSymlinks: false, attributes: ['type','extension'] });
    expect(tree).to.deep.equal(testTreeZeroDepth);
  })

  it('should respect "depth = 1" argument', () => {
    const tree = dirtree('./test/test_data', {depth: 1, normalizePath: true, followSymlinks: false, attributes: ['type','extension'] });
    expect(tree).to.deep.equal(testTreeFirstDepth);
  })

  it('should respect "depth = 2" argument', () => {
    const tree = dirtree('./test/test_data', {depth: 2, normalizePath: true, followSymlinks: false, attributes: ['type','extension'] });
    expect(tree).to.deep.equal(testTreeSecondDepth);
  })

  it('should throw error when combines size attribute with depth option', () => {
    expect(
        dirtree.bind(dirtree, './test/test_data', {depth: 2, normalizePath: true, followSymlinks: false, attributes: ['size', 'type','extension'] })
    ).to.throw('usage of size attribute with depth option is prohibited');
  })

});
