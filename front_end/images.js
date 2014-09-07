
    var uploadModule = angular.module("uploadModule", ['angularFileUpload', 'ngRoute', 'cfp.hotkeys'] );//'lvl.directives.dragdrop'
    var db_site = "http://127.0.0.1:9000/image/53f95f18508d243956283438/";
    var site = "https://api.imgur.com/3/image";
    var scroll_distance = 110;//暫定


    uploadModule.controller('uploadController', ['$scope', '$http', '$upload', 'hotkeys', function($scope, $http, $upload, hotkeys) {

$scope.imgs=[];//圖片(base64 or url)與檔案
$scope.files_num = 0;//這次要上傳幾張圖
$scope.current = 0;//db目前num最大是多少
$scope.total = 0;//db目前有幾筆資料
$scope.selected = [];//選到是1，沒被選到是0
$scope.selected_now = -1;//目前選到的是幾號


      hotkeys.add({
          combo: 'up',
          description: 'change selected target up',
          callback: function() {
            if($scope.selected_now >= 1 )//不接受0和-1
            {
              $scope.selected[  $scope.selected_now  ] = 0;
              $scope.selected_now -=1;
              $scope.selected[  $scope.selected_now  ] = 1;

              //swap order
              var temp;
              temp = $scope.imgs[$scope.selected_now+1];//原先位置
              $scope.imgs[$scope.selected_now +1] = $scope.imgs[$scope.selected_now];
              $scope.imgs[$scope.selected_now] = temp;
              window.scrollBy(0, -scroll_distance );//以選中者為中心移動畫面
            }
          }
        });
      hotkeys.add({
          combo: 'down',
          description: 'change selected target down',
          callback: function() {
            if($scope.selected_now < $scope.total -1  && $scope.selected_now > -1)//total會跟array差1且不接受最後一元素 &&不接受-1
            {
              $scope.selected[  $scope.selected_now  ] = 0;
              $scope.selected_now +=1;
              $scope.selected[  $scope.selected_now  ] = 1;


              //swap order
              var temp;
              temp = $scope.imgs[$scope.selected_now -1];//原先位置
              $scope.imgs[$scope.selected_now -1] = $scope.imgs[$scope.selected_now];
              $scope.imgs[$scope.selected_now] = temp;
              window.scrollBy(0, scroll_distance );//以選中者為中心移動畫面
            }
          }
        });

$scope.select = function(index){
  if( $scope.selected[index] ==1 )
  {
    $scope.selected[index] = 0;
    $scope.selected_now = -1;
  }
  else
  {
    //$scope.selected = _.map($scope.selected, function(){ return 0; });
    $scope.selected[ $scope.selected_now ] = 0;//取代原先上行寫法
    $scope.selected[index] = 1;
    $scope.selected_now = index;
  }
}

$scope.del = function(index, imgs_array, selected_array) {
        //欲上傳數-1 或者 已上傳數-1
        if($scope.imgs[index][1] !== undefined)
        {
            $scope.files_num -=1;
        }
        else
        {
            $scope.total -= 1;
        }
        //reset $scope.selected_now
        if($scope.selected_now == index)
        {
          $scope.selected_now = -1;
        }
        else if( index < $scope.selected_now)
        {
          $scope.selected_now -=1;//左移，變小
        }
        //$scope.selected_now < index 時，不動
        //$scope.selected_now = -1時不進入任何if

        selected_array.splice(index, 1);
        imgs_array.splice(index, 1);
        console.log("now total is " + $scope.total );
        console.log("del "+index);
  }

/*
$scope.dropped = function(dragEl, dropEl, imgs_array) { // function referenced by the drop target
          //this is application logic, for the demo we just want to color the grid squares
          //the directive provides a native dom object, wrap with jqlite
          var drop = angular.element(dropEl);
          var drag = angular.element(dragEl);

          var dropped_obj = drop['0']['tabIndex'];//['attributes']['0']['value'];
          var dragged_obj = drag['0']['tabIndex'];//['attributes']['0']['value'];

              //swap order
              var temp;
              temp = imgs_array[dropped_obj];
              imgs_array[dropped_obj] = imgs_array[dragged_obj];
              imgs_array[dragged_obj] = temp;
              $scope.$apply();


/*
              //swap files order
              temp = files_array[dropped_obj];
              files_array[dropped_obj] = files_array[dragged_obj];
              files_array[dragged_obj] = temp;
*/

        /*
          //clear the previously applied color, if it exists
          var bgClass = drop.attr('data-color');
          if (bgClass) {
            drop.removeClass(bgClass);
          }

          //add the dragged color
          bgClass = drag.attr("data-color");
          drop.addClass(bgClass);
          drop.attr('data-color', bgClass);

          //if element has been dragged from the grid, clear dragged color
          if (drag.attr("x-lvl-drop-target")) {
            drag.removeClass(bgClass);
          }

        }*/


$scope.onFileSelect = function($files) {

var i = 0, j = $scope.selected_now;
var imageType = /image.*/;
//$scope.files = $scope.files.concat($files);

  var reader = new FileReader();
      if( $files[i] !== undefined )
      {
        if( $files[i].type.match(imageType) )
        {
          //event trigger
          reader.readAsDataURL($files[i]);
        }
        else
        {
            alert("image files allowed only");
        }
      }


  //event
  reader.onload = function(e) {
          // Create a new image.
          var img = new Image();
          // Set the img src property using the data URL.
          img.src = reader.result;

          $scope.files_num +=1;
          $scope.total +=1;
          if(j > -1)
          {
            j +=1;
            $scope.imgs.splice(j, 0, [img.src, $files[i] ]);
            $scope.selected.push(0);//用push即可，因為是要在selected的後面生成，後面都是0所以沒差
          }
          else
          {
            $scope.imgs.push([img.src, $files[i] ]);//[img_src, file]
            $scope.selected.push(0);
          }
          $scope.$apply();
    }//end onload

    //event
  reader.onloadend = function(e){
      i++;
      if( $files[i] !== undefined )
      {
        if( $files[i].type.match(imageType) )
        {
          reader.readAsDataURL($files[i]);//event trigger
        }
        else
        {
            alert("image files allowed only");
        }
      }
  }//end onloadend
console.log(reader)

  };



      $scope.send = function (i, current, section){
    //$files: an array of files selected, each file has name, size, and type.

    //在發出post之後立刻發出下一個post
    while(i < $scope.imgs.length && section == 0)
    {
        if($scope.imgs[i][1] !== undefined)
        {
            $scope.send(i, $scope.current, 1);
            $scope.current +=1;
        }
        i+=1;//imgs_array中第幾個準備送出
    }

    //post request
    //上傳功能區塊
   if ( section == 1  ) {

      //console.log($scope.imgs[i][1]);
      $scope.upload = $upload.upload({
        url: site, //upload.php script, node.js route, or servlet url
        method: 'POST',
        headers: {'Authorization': 'Client-ID 31a85c32d28f5aa'},
        //withCredentials: true,
        data: {'image': $scope.imgs[i][1]},
        //file: file, // or list of files ($files) for html5 only
        //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s)
        // customize file formData name ('Content-Disposition'), server side file variable name.
        //fileFormDataName: myFile, //or a list of names for multiple files (html5). Default is 'file'
        // customize how data is added to formData. See #40#issuecomment-28612000 for sample code
        //formDataAppender: function(formData, key, val){}
      }).progress(function(evt) {
        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      }).success(function(data, status, headers, config) {
        // file is uploaded successfully
        console.log(data)
        console.log("upload yes");
        //current是目前數量，所以要寫到下1格
        $scope.sendDb(data, current + 1);//使用call by value，不用$scope.current
      })
      .error(function(){
        console.log("upload no");
      });
      //.then(success, error, progress);
      // access or attach event listeners to the underlying XMLHttpRequest.
      //.xhr(function(xhr){xhr.upload.addEventListener(...)})
    }
    /* alternative way of uploading, send the file binary with the file's content-type.
       Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed.
       It could also be used to monitor the progress of a normal http post/put request with large data*/
    // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.

      }//end send

      $scope.sendDb = function(d, i){
        var data_needed =   {
          "data" :{
                    link: d.data.link,
                    deletehash: d.data.deletehash,
                    id: d.data.id,
                    }
          }
        $http.post(db_site+i , data_needed)
        .success(function(data){
          console.log(data)
            console.log("db yes");
            $scope.total +=1;//這行沒有實質用處
            $scope.files_num -=1;
            if($scope.files_num == 0)
            {
              console.log("ok");
              //window.location.href ="./test.html";
            }
        })
        .error(function(){
            console.log("db no");
        });
      }

        $scope.getCurrent = function(){
            var i=0;
            $http({method: 'GET', url: db_site}).
            success(function(data, status, headers, config) {
              //取得目前db資料數後-1作為array的key使用
              $scope.total = data.data.length;
              i = $scope.total -1;
              if(data.data[i]===undefined)
              {
                $scope.current = 0;
              }
              else{
                for (var j = 0; j < data.data.length; j++) {
                  $scope.imgs.push([ data.data[j]['link'] ]);
                  $scope.selected.push(0);
                };
                $scope.current = data.data[i]['num']
              }
              console.log($scope.current);
            }).
            error(function(data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              console.log("fail");
            });
        };
$scope.getCurrent();
}]);//end controller
