const wallet = artifacts.require("./MyWallet.sol");
//const Asserts = require('./helper/asserts');

contract("MyWallet", function(accounts) {
    const OWNER = accounts[0];
    const ACC_1 = accounts[1];
    const ACC_2 = accounts[2];
    const InitialBalance = web3.toWei(1, 'ether');

    // let wallet;
    //
    // afterEach('reset state', () => {
    //     return MyWallet.new({value: InitialBalance})
    //         .then(inst => wallet = inst);
    // });
    //
    // before('setup', ()=>{
    //     return MyWallet.deployed()
    //       .then(inst => wallet = inst);
    // });

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

    it('should be possible to put money inside', function() {
       var contractInstance;
        return wallet.deployed().then(function(instance) {
            contractInstance = instance;
            return contractInstance.sendTransaction({value: web3.toWei(10, 'ether'), address:contractInstance.address, from: accounts[0]});
        }).then(function() {
            assert.equal(web3.eth.getBalance(contractInstance.address).toNumber(), web3.toWei(10, 'ether'), 'The Balance is the same');
        });
    });


    it('should be possible to get money back as the owner', function() {
        var walletInstance;
        var balanceBeforeSend;
        var balanceAfterSend;
        var amountToSend = web3.toWei(5, 'ether');
        return wallet.deployed().then(function(instance) {
            walletInstance = instance;
            balanceBeforeSend = web3.eth.getBalance(instance.address).toNumber();
            return walletInstance.spendMoneyOn(accounts[0], amountToSend, "Because I'm the owner", {from: accounts[0]});
        }).then(function() {
            return web3.eth.getBalance(walletInstance.address).toNumber();
        }).then(function(balance) {
            balanceAfterSend = balance;
            assert.equal(balanceBeforeSend - amountToSend, balanceAfterSend, 'Balance is now  ' + amountToSend + ' ether less than before');
        });
    });

    it('should be possible to propose and confirm spending money', function() {
        var walletInstance;
        return wallet.deployed().then(function(instance) {
            walletInstance = instance;
            return walletInstance.spendMoneyOn(accounts[1], web3.toWei(5,'ether'), "Because I need money", {from: accounts[1]});
        }).then(function() {

            //console.log('walletInstance.proposal_counter=', walletInstance.proposal_counter);
            assert.equal(web3.eth.getBalance(walletInstance.address).toNumber(), web3.toWei(5, 'ether'), 'Balance is now 5 ether less than before');
        });
    });

    // it('should be not be spending other account money', function() {
    //     var walletInstance;
    //     return wallet.deployed().then(function(instance) {
    //         walletInstance = instance;
    //         return walletInstance.spendMoneyOn(accounts[1], web3.toWei(5,'ether'), "Because I need money", {from: accounts[0]});
    //     })
    //     .then(proposalId => {
    //         console.log(proposalId);
    //         //assert.equal(proposalId, 0, "sent from owner, should be 0");
    //     })
    //     .then(function() {
    //         assert.equal(web3.eth.getBalance(walletInstance.address).toNumber(), web3.toWei(5, 'ether'), 'Balance is now 5 ether less than before');
    //     });
    // });

});
