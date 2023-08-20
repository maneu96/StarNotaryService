pragma solidity >=0.4.24;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721("Star","STR") {

    // Star data
    struct Star {
        string name;
    }

    // Implement Task 1 Add a name and symbol properties     DONE!!
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'
    

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    
    // Create Star using the Struct
    function createStar(string memory newName, uint256 tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(newName); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "You can't sell a Star you don't own");
        starsForSale[tokenId] = price;
    }


    // Function that allows you to convert an address into a payable address
    function _makePayable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 tokenId) public  payable {
        require(starsForSale[tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[tokenId];
        address ownerAddress = ownerOf(tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        _transfer(ownerAddress, msg.sender, tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        address payable ownerAddressPayable = _makePayable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    // Implement Task 1 lookUptokenIdToStarInfo  
    function lookUptokenIdToStarInfo (uint tokenId) public view returns (string memory) {
        Star memory x = tokenIdToStarInfo[tokenId];
        return x.name ; //1. You should return the Star saved in tokenIdToStarInfo mapping
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 tokenId1, uint256 tokenId2) public {
        address owner1 = ownerOf(tokenId1);
        address owner2 = ownerOf(tokenId2);
        require(msg.sender == owner1|| msg.sender == owner2, "you need to own the star");//1. Passing to star tokenId you will need to check if the owner of _tokenId1 or _tokenId2 is the sender
        //2. You don't have to check for the price of the token (star)
        _transfer(owner1,owner2,tokenId1);//3. Get the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId2)
        _transfer(owner2,owner1,tokenId2);//4. Use _transferFrom function to exchange the tokens.
        
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address to1, uint256 tokenId) public {
       require(msg.sender == ownerOf(tokenId), "You need to own this Star"); //1. Check if the sender is the ownerOf(_tokenId)
       _transfer(msg.sender, to1, tokenId); //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
    }

}
