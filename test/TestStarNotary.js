const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});

    let balanceOfUser2BeforeTransaction = web3.utils.toBN(await web3.eth.getBalance(user2));
    
    let TX = await instance.buyStar(starId, {from: user2, value: balance});
    //console.log(TX); // EDIT : get transaction information to estimate gas costs
    let gasUsed = web3.utils.toBN(TX.receipt.gasUsed);
    let gasPrice = web3.utils.toBN(TX.receipt.effectiveGasPrice);
    let gasCost = gasUsed.mul(gasPrice);
    let balanceAfterUser2BuysStar = web3.utils.toBN(await web3.eth.getBalance(user2));
    let cost = gasCost.add(web3.utils.toBN(starPrice));
    let deltaBalance = balanceOfUser2BeforeTransaction.sub(balanceAfterUser2BuysStar);
    //console.log(balanceOfUser2BeforeTransaction - (Number(starPrice)+gasCost))
    //console.log(Number(balanceAfterUser2BuysStar));
    //let value = Number(balanceOfUser2BeforeTransaction) - (Number(starPrice)+gasCost);
    assert.equal(cost.toString(), deltaBalance.toString());
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed();// 1. create a Star with different tokenId
    assert.equal(await instance.name.call(), "Star");//2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    assert.equal(await instance.symbol.call(),"STR");
});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();// 1. create 2 Stars with different tokenId
    let user1 = accounts[0];
    let user2 = accounts[1];
    let tokenId1 = 6// 2. Call the exchangeStars functions implemented in the Smart Contract
    let tokenId2 = 7// 3. Verify that the owners changed
    await instance.createStar('Star user 1', tokenId1,{from: user1});
    await instance.createStar('Star user 2', tokenId2,{from: user2});
    await instance.exchangeStars(tokenId1,tokenId2,{from:user1});
    assert.equal(await instance.ownerOf(tokenId2), user1);
    assert.equal(await instance.ownerOf(tokenId1), user2);
});

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();// 1. create a Star with different tokenId
    let user1 = accounts[0];// 2. use the transferStar function implemented in the Smart Contract
    let user2 = accounts[1];
    let tokenId = 8;// 3. Verify the star owner changed.
    await instance.createStar('Star test transfer', tokenId, {from: user1});
    await instance.transferStar(user2,tokenId,{from: user1})
    assert.equal(await instance.ownerOf(tokenId),user2);
    assert.notEqual(await instance.ownerOf(tokenId),user1);
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 9;
    await instance.createStar('Look Up Star', starId, {from: user1});
    let StarName = await instance.lookUptokenIdToStarInfo(starId);
    assert.equal(StarName, "Look Up Star");
});