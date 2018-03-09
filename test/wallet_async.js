const MyWallet = artifacts.require("./MyWallet.sol");
//const Asserts = require('./helper/asserts');
//var expect = require('chai').expect;
//var expect = chai.expect;
// require('chai')
//  .use(require('chai-as-promised'))
//  .should();

contract("MyWallet", function(accounts) {
    const OWNER = accounts[0];
    const ACC_1 = accounts[1];
    const ACC_2 = accounts[2];
    const InitialBalance = web3.toWei(1, 'ether');

    let walletInstance;

    // afterEach('reset state', async () => {
    //     walletInstance = await MyWallet.new({value: InitialBalance})
    // });
    // beforeEach('setup contract for each test', async function () {
    //   walletInstance = await MyWallet.new();
    // });

    before('setup', async () => {
        walletInstance = await MyWallet.deployed();
    });

    // describe('initial values', () => {
    //     it('balance', () => {
    //         return Promise.resolve()
    //             .then(() => {var ab = web3.eth.getBalance(wallet.address); console.log(ab.toNumber());})
    //             .then(bal => assert.equal(bal.toNumber(), InitialBalance, 'initial balance must be ' + InitialBalance));
    //     });
    // });
    //
    // describe('spend money', () => {
    //       let spendAmount = web3.toWei(0.5, 'ether');
    //
    //         it('should spend if owner and create proposal if another account', () => {
    //             return Promise.resolve()
    //                 .then(() => wallet.spendMoneyOn.call(ACC_1, spendAmount, "Send to Acc 1"))
    //                 .then(proposalId => {
    //                     assert.equal(proposalId.toNumber(), 0, "sent from owner, should be 0");
    //                 })
    //                 .then(() => wallet.spendMoneyOn.call(ACC_2, spendAmount, "Send to Acc 2", {from: ACC_1}))
    //                 .then(proposalId => {
    //                     assert.equal(proposalId.toNumber(), 1, "sent from ACC_1, should be 1");
    //                 });
    //         });
    //
    //         it('should confirm proposal', () => {
    //             let proposalID;
    //             let prevBalance;
    //
    //             return Promise.resolve()
    //               //  1. create proposal
    //                 .then(() => wallet.spendMoneyOn(ACC_2, spendAmount, "Send to Acc 2", {from: ACC_1}))
    //                 .then(tx => {
    //                   assert.equal(tx.logs.length, 1, 'single event shuold be emitted on spendMoneyOn');
    //
    //                   let log = tx.logs[0];
    //                   assert.equal(log.event, 'LogProposalReceived');
    //                   proposalID = log.args._id.toNumber();
    //                 })
    //               //  2. get previous balance
    //                 .then(() => web3.eth.getBalance(ACC_2))
    //                 .then(bal => {
    //                   console.log('prev: ' + bal.toNumber());
    //                   prevBalance = bal.toNumber();
    //                 })
    //               //  3. confirm proposal
    //               // 3.1 - use .call() to simulate transaction. I get true, so everything is OK.
    //                 .then(() => wallet.confirmProposal.call(proposalID))
    //                 .then(res => assert.isTrue(res))
    //               //  3.2 - send real transaction. There is no successfull event... How can it be? True if I simulate and no event here.
    //               .then(() => wallet.confirmProposal(proposalID))
    //               .then(tx => {
    //                 assert.equal(tx.logs.length, 1, 'single event shuold be emitted on confirmProposal');
    //                 assert.equal(tx.logs[0].event, 'LogProposalConfirmed', 'wrong event name');
    //               })
    //               //  4. verify balance
    //                .then(() => web3.eth.getBalance(ACC_2))
    //                .then(bal => {
    //                  console.log('new: ' + bal.toNumber());
    //                  assert.isTrue(bal.toNumber() - prevBalance == spendAmount, 'wrong new balance');
    //                })
    //
    //         });
    //       });
    //

    it('should be possible to put money inside', async () => {
        let amountToSend = web3.toWei(10, 'ether');
        await walletInstance.sendTransaction({value: amountToSend, address:walletInstance.address, from: OWNER});
        assert.equal(web3.eth.getBalance(walletInstance.address).toNumber(), amountToSend, 'The Balance is the same');
        //let amount3 = web3.eth.getBalance(walletInstance.address).toNumber();
        //expect(amount3).to.equal(web3.toWei(10, 'ether'));
        //amount3.should.equal(web3.toWei(10, 'ether'));
    });

    it('should be possible to get money back as the owner', async () => {
        let balanceBeforeSend = web3.eth.getBalance(walletInstance.address).toNumber();
        let amountToSend = web3.toWei(1, 'ether');
        await walletInstance.spendMoneyOn(OWNER, amountToSend, "Because I'm the owner", {from: OWNER});
        // console.log(walletInstance.address);
        // console.log(accounts[0]);
        // console.log(accounts[1]);
        //console.log(msg.sender);
        let balanceAfterSend = web3.eth.getBalance(walletInstance.address).toNumber();
        assert.equal(balanceBeforeSend - amountToSend, balanceAfterSend, 'Balance is now ' + amountToSend + ' ether less than before');
    });

    it('should be possible to propose and confirm spending money', async () => {
        let balanceBeforeSend = web3.eth.getBalance(walletInstance.address).toNumber();
        let amountToSend = web3.toWei(2, 'ether');
        let tx = await walletInstance.spendMoneyOn(ACC_1, amountToSend, "Because I need money", {from: ACC_1});
        let balanceAfterSend = web3.eth.getBalance(walletInstance.address).toNumber();
        assert.equal(balanceBeforeSend, balanceAfterSend, 'Balance is should not change');
        let log = tx.logs[0];
        assert.equal(log.event, 'proposalReceived');
        let proposalId = log.args.proposal_id.toNumber();
        //console.log('proposalId=', proposalId);
        assert.equal(proposalId, 1, "sent from not owner, should be 1");
    });

    it('should be not be spending other account money', async () => {
        let tx = await walletInstance.spendMoneyOn(ACC_1, web3.toWei(3,'ether'), "Because I need money", {from: ACC_1});
        assert.equal(tx.logs.length, 1, 'single event shuold be emitted on spendMoneyOn');
        let log = tx.logs[0];
        assert.equal(log.event, 'proposalReceived');
        let proposalId = log.args.proposal_id.toNumber();
        //console.log('proposalId=', proposalId);
        assert.equal(proposalId, 2, "sent from not owner, should be 2");
    });

    it('should be confirm proposal money', async () => {
        let proposalId = 1;
        let balanceBeforeConfirm = web3.eth.getBalance(walletInstance.address).toNumber();
        let success = await walletInstance.confirmProposal.call(proposalId, {from: OWNER});
        assert.isTrue(success);
        let tx = await walletInstance.confirmProposal(proposalId, {from: OWNER});
        let log = tx.logs[0];
        assert.equal(tx.logs.length, 1, 'single event shuold be emitted on confirmProposal');
        assert.equal(log.event, 'proposalConfirmed', 'wrong event name');
        let balanceAfterConfirm = web3.eth.getBalance(walletInstance.address).toNumber();
        assert.equal(balanceBeforeConfirm - web3.toWei(2, 'ether'), balanceAfterConfirm, "value should deduct");
    });

});
