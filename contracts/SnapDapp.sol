// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
// pragma experimental ABIEncoderV2;

contract SnapDapp {
  address public contractOwner; // from solidity 0.8.0 we don't need to declare the address as payable explicitly, but when you rare transferring an amount to such address. 
  string public name = "SnapDapp";

  constructor(address _ownerAddress){
      contractOwner = _ownerAddress;
  }


  struct Image{
      uint id;
      string hash;
      string description;
      uint tipAmount;
      uint minSellingPrice;
      address author; 
      address imgOwner; 
      uint bidderCount;
      bool wantToSell;
      uint boughtCount;
      address[] buyers;
      mapping(address => uint) requests; // buying requests with buyer address and paid amount
      mapping(address => uint) tippedBy; // it will contain address of the people who tipped with amount
      mapping(uint => bytes32[]) boughtAt; // number of times it has beed bought and array with address and amount // FIXME: also with time 
  }

  struct MyOrders{
    address imgOwner;
    uint[] imgs;
  }
  
  mapping(address => MyOrders) public orders; 
  
  
  uint public imageCount = 0;

  // store Images 
  mapping(uint => Image) public images;

  
  modifier restricted() {
    require(
      msg.sender == contractOwner,
      "This function is restricted to the contract's owner"
    );
    _;
  }
  
        /*
    Which function is called, fallback() or receive()?

           send Ether
               |
         msg.data is empty?
              / \
            yes  no
            /     \
receive() exists?  fallback()
         /   \
        yes   no
        /      \
    receive()   fallback()
    */
    
    // functon to receive ETH. msg.data must be empty
    receive() external payable {}
    
    // fallback function is called when msg.data is not empty
    fallback() external payable {}
    
    function getBalance() public view returns(uint){
        return address(this).balance;
    }

  // event to emit when image is posted
    event ImagePosted(
        uint id,
        string hash, 
        string description,
        address author
    );

  // event to emit when image is tipped
    event ImageTipped(
        uint id,
        string hash, 
        string description,
        uint tipAmount,
        address author
    );

  // image buying request
    event ImageRequest(
        string msg, 
        string actionType
    );

  // event to emit when image is bought
    event ImageBought(
        string msg, 
        string actionType
    );

    // change Price 
    event ChangePriceOrSell(
        string msg,
        address imgOwner
    );

    // post image
    function uploadImage(string memory _imgHash, string memory _description,  uint _minSellingPrice, bool _wantToSell) public{

        // make sure image hash exists
        require(bytes(_imgHash).length > 0, "image hash is required");
        // console.log(bytes(_imgHash));

        // make sure image description exists
        require(bytes(_description).length > 0, "description is required");

        // make sure minimum selling price exists
        require(_minSellingPrice > 0, "minimum selling price is required!");

        // make sure uploader address exists
        require(msg.sender != address(0x0), "Wrong Address!");
        

        // increment image id
        imageCount++;

        ////TYPE ERROR:  we cannot do like this:  because Image type variable contains nested mapping
        // images[imageCount] = Image( 
        //     imageCount, 
        //     _imgHash, 
        //     _description, 
        //     0, 
        //     _minSellingPrice, 
        //     msg.sender, 
        //     msg.sender
        // );
        
        
        // add image to contract 
        Image storage newImage = images[imageCount];
        newImage.id = imageCount;
        newImage.hash = _imgHash;
        newImage.description = _description;
        newImage.tipAmount = 0;
        newImage.minSellingPrice = _minSellingPrice;
        newImage.author = msg.sender;
        newImage.imgOwner = msg.sender;
        newImage.wantToSell = _wantToSell;
        
        emit ImagePosted(
            imageCount, 
            _imgHash, 
            _description, 
            msg.sender
        );
    }
    
    // tip image owner
    function tipImageOwner(uint _id) public payable{
    
        // make sure given id is valid
        require(_id > 0 && _id <= imageCount);
        
        
        // fetch the image
        // Image memory _image = images[_id];

        Image storage _image = images[_id]; // saved in storage because I will work directly on it, not on the copy of it
        
        // fetch the author
        address _author = _image.author;
        
        // fetch the current image owner
        address _imgOwner = _image.imgOwner;
        
        // tip the author by sending some ether
        uint _authorReward = (msg.value * 20)/100;  // 20%
        uint _ownerReward = (msg.value * 80)/100;   // 80%
        
        // here 20% of amount will be transferred to imgAuthor and 80% amount will be transferred to ImageOwner
        
        // check if author and imgOwner are same or different 
        if(_author != _imgOwner){
            payable(_author).transfer(_authorReward);
            payable(_imgOwner).transfer(_ownerReward);
        }
        else{
            payable(_author).transfer(msg.value);
        }
        
        // increament the tip amount of the image
        _image.tipAmount += msg.value;
        
        // now add tipper in the mapping of tippedBy with tipped amount
        _image.tippedBy[msg.sender] += msg.value;
        
        
        emit ImageTipped(
            _id, 
            _image.hash, 
            _image.description, 
            _image.tipAmount, 
            _author
        );
    }
    
    
    
    
    // make a request for buying image
    function buyImageRequest(uint _id) public payable returns(bytes memory){
        // make sure given id is valid
        require(_id > 0 && _id <= imageCount);
        
        // fetch the image
        Image storage _image = images[_id];
        
        // fetch the current image owner
        address _imgOwner = _image.imgOwner;
        
        require(msg.value <= _image.minSellingPrice && msg.value > 0, "price should be between 0 and expected price!");
        
        // check if buyer has already locked an order or not
        require(_image.requests[msg.sender] == 0, "Your order already has been locked! please delete old order and creating new.");
        
        // if buyer's offered price is equal or more than the seller's expected price then transfer money to the current owner and directly change owner
        
        if(_image.minSellingPrice <= msg.value && _image.wantToSell){
            // check if image is for sale or not
        
            //// transfer money directly to the owner
            //payable(_imgOwner).transfer(msg.value); //this method id not longer allowed for transferring ETH
        
            //// Call returns a boolean value indicating success or failure.
            (bool sent, bytes memory data) = payable(_imgOwner).call{value: msg.value}("");
            
            require(sent, "Failed to send ETH!");
            
            
            // now change owner
            _image.imgOwner = msg.sender;
            
            // now remove from sale
            _image.wantToSell = false;
            
            _image.boughtCount++;
            
            _image.boughtAt[_image.boughtCount] = [bytes32(uint256(uint160(msg.sender))), bytes32(msg.value)];
            
            _image.bidderCount++; 
            
            _image.requests[msg.sender] = 0; 
            
            emit ImageBought('Hurray! Image is yours!', 'buy');
            return data;
                    
        }else{
            // create and lock order for buying image at given value
            _image.requests[msg.sender] = msg.value;  
            
            // address[] memory _buyersList = _image.buyers;

            _image.buyers.push(msg.sender);
            
            
            // lock amount in the contract 
            (bool sent, bytes memory data) = payable(this).call{value: msg.value}("");
            
            require(sent, "Failed to send ETH!");
            
            _image.bidderCount++; 
            
            MyOrders storage _myorders = orders[msg.sender];
            _myorders.imgOwner = msg.sender;
            _myorders.imgs.push(_id);
            
            
            emit ImageRequest('Order Placed Successfuly!', 'req');
            return data;
        }
    }
    
    // get request 
    function getRequest(uint _id, address _address) public view returns(uint){
        return images[_id].requests[_address];
    } 
    
    
    // TODO: remove auction option from image
    function removeFromSale(uint _id) public{
                // make sure given id is valid
        require(_id > 0 && _id <= imageCount);
        
        // fetch the image
        Image storage _image = images[_id];
        
        require(msg.sender == _image.imgOwner, "yout are not authorized!");
        
        _image.wantToSell = false;
    }
    
    function getBuyersFromList(uint _imgId, uint _index) public view returns(address){
        // make sure given id is valid
        require(_imgId > 0 && _imgId <= imageCount, "not valid image id!");
        
        address currentBuyer = images[_imgId].buyers[_index];
        
        return currentBuyer;
    }
    
    function getTotalBuyers(uint _imgId) public view returns(uint){
        // make sure given id is valid
        require(_imgId > 0 && _imgId <= imageCount, "not valid image id!");
        
        return images[_imgId].buyers.length;
    }
    
    
    
    // change the selling price 
    function changePriceOrSell(uint _id, uint _minSellingPrice) public{
                // make sure given id is valid
        require(_id > 0 && _id <= imageCount);
        
        // fetch the image
        Image storage _image = images[_id];
        
        require(msg.sender == _image.imgOwner, "you are not authorized!");
        
        if(!_image.wantToSell){
            _image.wantToSell = true;
        }

        _image.minSellingPrice = _minSellingPrice;
        
        address[] memory _buyersList = _image.buyers;
        uint buyersLen = _buyersList.length;
        bool buyerAvailable = false;
        uint i = 0;
        
        // check in the requests if someone wants to buy this image or not at expected price, if yes then sell the image
        while(i < buyersLen && !buyerAvailable){
            address currentAddr = _buyersList[i];
            
            
            if(_image.requests[currentAddr] == _minSellingPrice){
                buyerAvailable = true;
            
                // transfer money from contract now.
                (bool sent, bytes memory data) = payable(_image.imgOwner).call{value: _minSellingPrice}("");
                
                require(sent, "Failed to send ETH!");
                
                
                // now change owner
                _image.imgOwner = currentAddr;
                
                // now remove from sale
                _image.wantToSell = false;
                
                _image.boughtCount++;
                
                _image.boughtAt[_image.boughtCount] = [bytes32(uint256(uint160(currentAddr))), bytes32(_minSellingPrice)];
                
                _image.requests[currentAddr] = 0; 

                
            }
            i++;
        }
        if(buyerAvailable){
            emit ChangePriceOrSell('Image sold!', _image.imgOwner);
        }else{
            emit ChangePriceOrSell('Price Updated!', _image.imgOwner);
        }
        
    }
    
    
    // TODO: Delete order and get refund
    function removeOrder(uint _imgId) public returns (bytes memory){ 
        require(_imgId > 0 && _imgId <= imageCount);
        
        // fetch the image
        Image storage _image = images[_imgId];
        
        // check if this user is available or not 
        require(_image.requests[msg.sender] != 0, 'No order found!');
        
        // transfer money from contract now.
        (bool sent, bytes memory data) = payable(msg.sender).call{value: _image.requests[msg.sender]}("");
                
        require(sent, "Failed to send ETH!");
        
        _image.requests[msg.sender] = 0;
        
        MyOrders storage _orders =  orders[msg.sender];
        
        uint[] memory _imgs = _orders.imgs;
        uint[] memory tmp = _orders.imgs;
        
        for(uint i= 0; i < tmp.length; i++ ){
            if(tmp[i] == _imgId){
                delete _imgs[i];
                _orders.imgs = _imgs;
                return data;
            }
        }
        
        return data;

        
    }
    
    
    function getOrders(address _address) external view returns(uint[] memory){
         MyOrders memory _orders = orders[_address];
        return _orders.imgs;
    }
}








