//JavaScript code for simulation of neutron Laue diffraction pattern for TAIKAN

var version = "0.1";

// dimensions of the canvas object
var scaleX=800;
var scaleY=500;
const mm2Xpixel=0.4;
const mm2Ypixel=0.4;

//physical constant
const TOFconst = 2.286;       // TOF at 1 m is 2.286/sqrt(E)

//parameters for the appearance of the simulation
const decimal_digit=1000;     // decimal digit for UBmatrix
const radius=4;       // radius of circles showing refletions in the simulation.
const radius_tgt=8;     //// radius of a circle showing a target refletions in the simulation.
const txt_ofst1=radius+10;   //offset along Y direction for indices shown near each reflection.
const txt_ofst2=3;   //offset along X direction for detector number shown bottom.
const txt_ofst3=30;   //offset along X direction for detector number shown bottom.
const fundamental_color="rgb(250, 250, 0)";
const obs_spot_color="rgb(250, 50, 0)";
const q_vec_colors = ["rgb(50, 220, 50)","rgb(50, 150, 250)","rgb(250, 150, 100)"];
const center_gap =10; 
const ofst_X =5; 
const center_ofst_Y =0;
const bank_gap_disp = 10; 

//variables for calculating Laue diffraction patterns.-------------------
var u = new Array(3); // indices, pallarel to the incident beam
var v = new Array(3); // indices, another direction in the horizontal plane including the incidnet beam

var ux = new Array(3);
var vx = new Array(3);

var Rot0 = new Array(3);
var Rot1 = new Array(3);
var Rot2 = new Array(3);
var Rot =[Rot0, Rot1, Rot2];    // 3x3 rotation matrix

var a_unit = new Array(3);  // unit vector of primitive translation vectors
var b_unit = new Array(3);
var c_unit = new Array(3);

var a_star = new Array(3);  // reciprocal lattice vectors
var b_star = new Array(3);
var c_star = new Array(3);

var as_len;
var bs_len;
var cs_len;

var RefCon = '';

var Hmax;
var Kmax;
var Lmax;

var Lambda_min = 0.65;
var Lambda_max = 4.4;

var lambda;             // wavelength 

var Omega=0;


//parameters regarding the detector banks--------------------------------------------------
const LB20 = 4004.0 // distance from sample to the center of high-angle detector bank
const widthB = 1324.87 // full width of detector array for a bank
// Max and min angles of the detectors on the equator plane.
const BankHorAngleMin = [-31.652/180.0*Math.PI, -54.152/180.0*Math.PI, -76.652/180.0*Math.PI, -99.152/180.0*Math.PI,-121.652/180.0*Math.PI,-144.152/180.0*Math.PI,-166.652/180.0*Math.PI,58.348/180.0*Math.PI, 80.848/180.0*Math.PI,103.348/180.0*Math.PI,125.848/180.0*Math.PI,148.348/180.0*Math.PI]; // angles of the right edge of the detector banks (rad) 
const BankHorAngleMax = [-13.348/180.0*Math.PI, -35.848/180.0*Math.PI, -58.348/180.0*Math.PI, -80.848/180.0*Math.PI,-103.348/180.0*Math.PI,-125.848/180.0*Math.PI,-148.348/180.0*Math.PI,76.652/180.0*Math.PI, 99.152/180.0*Math.PI,121.652/180.0*Math.PI,144.152/180.0*Math.PI,166.652/180.0*Math.PI]; // angles of the right edge of the detector banks (rad) 
const BankNumBL19side = 5;
const BankNumBL17side = 7;

// angles between ki and normal vectors of the detector surfaces (on the horizontal plane).
const alpha = [-22.5/180.0*Math.PI,-22.5*2/180.0*Math.PI,-22.5*3/180.0*Math.PI,-22.5*4/180.0*Math.PI,-22.5*5/180.0*Math.PI,-22.5*6/180.0*Math.PI,-22.5*7/180.0*Math.PI,22.5*3/180.0*Math.PI,22.5*4/180.0*Math.PI,22.5*5/180.0*Math.PI,22.5*6/180.0*Math.PI,22.5*7/180.0*Math.PI]       //angles between the normal vectors of the detector banks and ki (rad).
const L2b = 800.0;        //lengths of the normal vectors of the middle detector banks from the sample position (mm).

const BankWidth = 256;    // in mm unit. BankHeight is equal to BankWidth
const Bank_VGap = 64;       // vertical gap between middle and upper/lower detectors.

var DetBankSide="BL17side";

const Porg_center =[        // for Porg_center vector, [x,y,z] : x perpendicular to ki and y(vertical), z is parallel to ki (HRC coordinates)
    [L2b*Math.sin(Math.PI/180.0*(-22.5)),0.0,L2b*Math.cos(Math.PI/180.0*(-22.5))],    //SMBL16
    [L2b*Math.sin(Math.PI/180.0*(-22.5*2.0)),0.0,L2b*Math.cos(Math.PI/180.0*(-22.5*2.0))],    //SMBL16
    [L2b*Math.sin(Math.PI/180.0*(-22.5*3.0)),0.0,L2b*Math.cos(Math.PI/180.0*(-22.5*3.0))],    //SMBL16
    [L2b*Math.sin(Math.PI/180.0*(-22.5*4.0)),0.0,L2b*Math.cos(Math.PI/180.0*(-22.5*4.0))],    //SMBL16
    [L2b*Math.sin(Math.PI/180.0*(-22.5*5.0)),0.0,L2b*Math.cos(Math.PI/180.0*(-22.5*5.0))],    //SMBL16
    [L2b*Math.sin(Math.PI/180.0*(-22.5*6.0)),0.0,L2b*Math.cos(Math.PI/180.0*(-22.5*6.0))],    //SMBL16
    [L2b*Math.sin(Math.PI/180.0*(-22.5*7.0)),0.0,L2b*Math.cos(Math.PI/180.0*(-22.5*7.0))]    //SMBL16
]

//variables for 3D orientation viewer-----------------------------------------------------
const arrow_scale = 100;        //arrows for a*, b* and c*: convert A-1 to pixel.
const arrow_HeadLen = 20;       //lengths of arrowheads (pixel)
const arrow_HeadWidth = 10;     //widths of arrowheads (pixel)
const DetBankScale = 0.3;   // convert mm to pixel.
const DetBankThickness = 10; //pixel


function init_draw(){
    document.getElementById("verNum").innerHTML=version;
    document.getElementById("verNum2").innerHTML=version;
    setFreeRotMode();
    draw();
}

function draw() {
    set_Lattice();
    set_ReflectionCondition();
    showUBmatrix();
    Lambda_min_adjust_and_draw();
    draw_OriViewer();

}

function set_RefCon_and_draw(){
    set_ReflectionCondition();
    draw_DetMap();
}

function rot_and_draw(rot_ax_dir) {
    rot_Lattice(rot_ax_dir);
    showUBmatrix();
    draw_DetMap();
    draw_OriViewer();
}

function switch_DetBank_and_draw(){
    DetBankSide = document.getElementById('DetBank_side').value;
    draw_DetMap();
    draw_OriViewer();
}

function Lambda_min_adjust_and_draw(){
    document.getElementById("Lambda_min_disp").value = document.getElementById("Lambda_min").value;
    Lambda_min = Number(document.getElementById("Lambda_min").value);
    document.getElementById("Lambda_max_disp").value = document.getElementById("Lambda_max").value;
    Lambda_max = Number(document.getElementById("Lambda_max").value);
    draw_DetMap();
}

function omegaRot_and_draw(){
    let targetOmega=Number(document.getElementById("targetOmega").value);
    const deltaOmega = (targetOmega-Omega)/180.0*Math.PI;
    if(document.getElementById("omg_CCW").checked){
        xyz_rotation(2,deltaOmega);    //"2" means rotation about the z axis. a minus sign is necessary because directions of omega- and z-rotations are opposite to each other.
    }
    else{
        xyz_rotation(2,-deltaOmega);    //"2" means rotation about the z axis. a minus sign is necessary because directions of omega- and z-rotations are opposite to each other.
    }
    showUBmatrix();
    draw_DetMap();
    draw_OriViewer();
    Omega=targetOmega;
    document.getElementById("currentOmega_disp").innerHTML=String(Omega);
}

function set_Lattice(){

    //input parameters: lattice constants and sample orientation)
    let a = Number(document.getElementById('a').value);
    let b = Number(document.getElementById('b').value);
    let c = Number(document.getElementById('c').value);
    let alpha = Number(document.getElementById('alpha').value)/180.0*Math.PI;   // in radian
    let beta  = Number(document.getElementById('beta').value)/180.0*Math.PI;    // in radian
    let gamma = Number(document.getElementById('gamma').value)/180.0*Math.PI;   // in radian
    u[0] = Number(document.getElementById('u1').value);
    u[1] = Number(document.getElementById('u2').value);
    u[2] = Number(document.getElementById('u3').value);
    v[0] = Number(document.getElementById('v1').value);
    v[1] = Number(document.getElementById('v2').value);
    v[2] = Number(document.getElementById('v3').value);

    // calculation
    let DD = (Math.cos(alpha)-Math.cos(gamma)*Math.cos(beta))/Math.sin(gamma);
    let PP = Math.sqrt(Math.sin(beta)-DD**2.0);

    ux[0] = 2.0*Math.PI*u[0]/a;
    ux[1] = 2.0*Math.PI*(-u[0]/a/Math.tan(gamma)+u[1]/b/Math.sin(gamma));
    ux[2] = 2.0*Math.PI*(u[0]/a*(DD/Math.tan(gamma)-Math.cos(beta))-u[1]/b*DD/Math.sin(gamma)+u[2]/c)/PP;
    vx[0] = 2.0*Math.PI*v[0]/a;
    vx[1] = 2.0*Math.PI*(-v[0]/a/Math.tan(gamma)+v[1]/b/Math.sin(gamma));
    vx[2] = 2.0*Math.PI*(v[0]/a*(DD/Math.tan(gamma)-Math.cos(beta))-v[1]/b*DD/Math.sin(gamma)+v[2]/c)/PP;

    let uy2uz2 = ux[1]**2.0+ux[2]**2.0;    
    let Uabs = Math.sqrt(ux[0]**2.0+uy2uz2);
    let Rvy;
    let Rvz;
    if(uy2uz2==0){
        Rvy=vx[1];
        Rvz=vx[2];
    }
    else{
        Rvy =(-vx[0]*ux[1]+(vx[1]*(ux[0]*ux[1]**2.0+Uabs*ux[2]**2.0)+vx[2]*ux[1]*ux[2]*(ux[0]-Uabs))/uy2uz2)/Uabs;
        Rvz =(-vx[0]*ux[2]+(vx[2]*(ux[0]*ux[2]**2.0+Uabs*ux[1]**2.0)+vx[1]*ux[2]*ux[1]*(ux[0]-Uabs))/uy2uz2)/Uabs;
    }
    
    let cosphi=Rvy/Math.sqrt(Rvy**2.0+Rvz**2.0);
    let sinphi=Rvz/Math.sqrt(Rvy**2.0+Rvz**2.0);

    Rot[0][0]= ux[0]/Uabs;
    Rot[0][1]= ux[1]/Uabs;
    Rot[0][2]= ux[2]/Uabs;
    Rot[1][0]= -(ux[1]*cosphi+ux[2]*sinphi)/Uabs;
    Rot[1][1]=(ux[2]*(ux[2]*cosphi-ux[1]*sinphi)+ux[0]*ux[1]*(ux[1]*cosphi+ux[2]*sinphi)/Uabs)/uy2uz2;
    Rot[1][2]=(ux[1]*(ux[1]*sinphi-ux[2]*cosphi)+ux[0]*ux[2]*(ux[2]*sinphi+ux[1]*cosphi)/Uabs)/uy2uz2;
    Rot[2][0]=(ux[1]*sinphi-ux[2]*cosphi)/Uabs;
    Rot[2][1]=(-ux[2]*(ux[1]*cosphi+ux[2]*sinphi)+ux[0]*ux[1]*(ux[2]*cosphi-ux[1]*sinphi)/Uabs)/uy2uz2;
    Rot[2][2]=(ux[1]*(ux[1]*cosphi+ux[2]*sinphi)+ux[0]*ux[2]*(ux[2]*cosphi-ux[1]*sinphi)/Uabs)/uy2uz2;

    for (let i=0;i<3;i++){
        a_unit[i]= Rot[i][0];
        b_unit[i]= Rot[i][0]*Math.cos(gamma)+Rot[i][1]*Math.sin(gamma);
        c_unit[i]= Rot[i][0]*Math.cos(beta)+Rot[i][1]*DD+Rot[i][2]*PP;
    } 

    // output parameters: 3 reciprocal lattice vectors, a*, b*, and c*
    for (let i=0;i<3;i++){
        a_star[i]= 2.0*Math.PI/a/PP/Math.sin(gamma)*(b_unit[(i+1)%3]*c_unit[(i+2)%3]-b_unit[(i+2)%3]*c_unit[(i+1)%3]);
        b_star[i]= 2.0*Math.PI/b/PP/Math.sin(gamma)*(c_unit[(i+1)%3]*a_unit[(i+2)%3]-c_unit[(i+2)%3]*a_unit[(i+1)%3]);
        c_star[i]= 2.0*Math.PI/c/PP/Math.sin(gamma)*(a_unit[(i+1)%3]*b_unit[(i+2)%3]-a_unit[(i+2)%3]*b_unit[(i+1)%3]);
    }
    
    as_len = Math.sqrt(a_star[0]**2.0+a_star[1]**2.0+a_star[2]**2.0);
    bs_len = Math.sqrt(b_star[0]**2.0+b_star[1]**2.0+b_star[2]**2.0);
    cs_len = Math.sqrt(c_star[0]**2.0+c_star[1]**2.0+c_star[2]**2.0);

}

function set_ReflectionCondition(){
    RefCon = document.getElementById("RefCon").value;
}

function check_ReflectionCondition(RefCon,H,K,L){
    var retstr=false;

    switch(RefCon){
        case 'none':
            retstr=true;
            break;
        case 'H+K=2n':
            if((H+K)%2==0){
                retstr=true;
            }
            break;
        case 'H+L=2n':
            if((H+L)%2==0){
                retstr=true;
            }
            break;
        case 'K+L=2n':
            if((K+L)%2==0){
                retstr=true;
            }
            break;
        case 'H+K+L=2n':
            if((H+K+L)%2==0){
                retstr=true;
            }
            break;
        case 'H,K,L all even or all odd':
            let hklsp = Math.abs(H%2)+Math.abs(K%2)+Math.abs(L%2);
            if(hklsp==0||hklsp==3){
                retstr=true;
            }
            break;
        case '-H+K+L=3n':
            if((-H+K+L)%3==0){
                retstr=true;
            }
            break;
        default:
            retstr=true;
    }
    return retstr;
}

function draw_DetMap(){

    var canvas = document.getElementById('CanvasDetMap');
    var context = canvas.getContext('2d');

    //refresh
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgb(0, 0, 0)";
    context.lineWidth=1;
    

    //set background color
    context.fillStyle = "rgb(100, 100, 100)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "rgb(0, 0, 100)";
    context.strokeStyle = "rgb(200, 200, 200)";

    context.font = "14px sans-serif";

    let bankNumMax =BankNumBL17side;
    if (DetBankSide=="BL19side"){
        bankNumMax = BankNumBL19side;
    }

    x_pixel_start=0;
    for(let banknum=0;banknum<bankNumMax;banknum++){
        //middle bank
        context.fillRect(x_pixel_start+ofst_X, canvas.height/2.0+center_ofst_Y-BankWidth/2.0*mm2Ypixel, BankWidth*mm2Xpixel, (BankWidth)*mm2Ypixel);        
        context.strokeRect(x_pixel_start+ofst_X, canvas.height/2.0+center_ofst_Y-BankWidth/2.0*mm2Ypixel, BankWidth*mm2Xpixel, (BankWidth)*mm2Ypixel);        
        //upper bank
        context.fillRect(x_pixel_start+ofst_X, canvas.height/2.0+center_ofst_Y-(BankWidth/2.0+BankWidth)*mm2Ypixel-bank_gap_disp, BankWidth*mm2Xpixel, (BankWidth)*mm2Ypixel);        
        context.strokeRect(x_pixel_start+ofst_X, canvas.height/2.0+center_ofst_Y-(BankWidth/2.0+BankWidth)*mm2Ypixel-bank_gap_disp, BankWidth*mm2Xpixel, (BankWidth)*mm2Ypixel);        
        //lower bank
        context.fillRect(x_pixel_start+ofst_X, canvas.height/2.0+center_ofst_Y+(BankWidth/2.0)*mm2Ypixel+bank_gap_disp, BankWidth*mm2Xpixel, (BankWidth)*mm2Ypixel);        
        context.strokeRect(x_pixel_start+ofst_X, canvas.height/2.0+center_ofst_Y+(BankWidth/2.0)*mm2Ypixel+bank_gap_disp, BankWidth*mm2Xpixel, (BankWidth)*mm2Ypixel);        
        context.fillStyle = "rgb(255, 255, 255)";
        context.fillStyle = "rgb(0, 0, 100)";
        x_pixel_start+=BankWidth*mm2Xpixel+bank_gap_disp;
    }



    // color setting for circles indicating reflections
    context.strokeStyle = fundamental_color;
    context.fillStyle = fundamental_color;
    context.lineWidth=2;
    context.font = "10px sans-serif";

    let Qmax = 4.0*Math.PI/Lambda_min;
    Hmax = Math.floor(Qmax/as_len);
    Kmax = Math.floor(Qmax/bs_len);
    Lmax = Math.floor(Qmax/cs_len);

    let Ghkl=new Array(3);
    let isTargetHKL=false;
    let showHKL=false;
    for (var H=-Hmax;H<=Hmax;H+=1){
        for (var K=-Kmax;K<=Kmax;K+=1){
            for (var L=-Lmax;L<=Lmax;L+=1){

                if(check_ReflectionCondition(RefCon,H,K,L)==false){
                    // Reflection condition is not satisfied or H=K=L=0.
                }
                else{
                    // funcamental reflections
                    context.strokeStyle = fundamental_color;
                    context.fillStyle = fundamental_color;
                    showHKL=true;
                    drawBraggReflection(context,H,K,L,isTargetHKL,showHKL);

                    // reflections with q-vectors
                    for(let p=0;p<q_vec_colors.length;p++){
                        let cb_label = 'q'+(p+1)+'_checkbox';
                        let qh_label = 'q'+(p+1)+'_h';
                        let qk_label = 'q'+(p+1)+'_k';
                        let ql_label = 'q'+(p+1)+'_l';
                        let showHKL_label = 'q'+(p+1)+'_showHKL';
                        if(document.getElementById(cb_label).checked==true){
                            context.strokeStyle = q_vec_colors[p];
                            context.fillStyle = q_vec_colors[p];
                            showHKL=document.getElementById(showHKL_label).checked;
                            let q1_H = Number(document.getElementById(qh_label).value); 
                            let q1_K = Number(document.getElementById(qk_label).value); 
                            let q1_L = Number(document.getElementById(ql_label).value); 
                            drawBraggReflection(context,H+q1_H,K+q1_K,L+q1_L,isTargetHKL,showHKL);
                            drawBraggReflection(context,H-q1_H,K-q1_K,L-q1_L,isTargetHKL,showHKL);    
                        }
    
                    }
                }
            }
        }
    }

    //draw large circle for the target reflection.
    isTargetHKL=true;
    showHKL=false;
    context.strokeStyle = fundamental_color;
    let Ht=-Number(document.getElementById("Ht").value);
    let Kt=-Number(document.getElementById("Kt").value);
    let Lt=-Number(document.getElementById("Lt").value);
    //minus signs are necessary to convert Q=kf-ki to Q=ki-kf.

    let isAccessible = false;
    document.getElementById("Q_len").innerHTML="[not accessible]";
    document.getElementById("phi").innerHTML="[not accessible]";
    document.getElementById("phih").innerHTML="[not accessible]";
    document.getElementById("phiv").innerHTML="[not accessible]";
    document.getElementById("lambda").innerHTML="[not accessible]";
//    document.getElementById("Azimuth").innerHTML="[not accessible]";
    drawBraggReflection(context,Ht,Kt,Lt,isTargetHKL,showHKL);

}

function drawBraggReflection(context1,H1,K1,L1,isTargetHKL1,showHKL1){

    let canvas = document.getElementById('CanvasDetMap');

    let return_value=false;

    let Ghkl=new Array(3);

    for(let i=0;i<3;i++){
        Ghkl[i]=H1*a_star[i]+K1*b_star[i]+L1*c_star[i];
    }
    if(Ghkl[0]>=0.0){
        // Bragg's law is not satisfied.
    }
    else{  
        let G_sq = Ghkl[0]**2.0+Ghkl[1]**2.0+Ghkl[2]**2.0;
        let Ki = -0.5*G_sq/Ghkl[0]; // Ki >0
        lambda = 2.0*Math.PI/Ki;    // Angstrome
        //let Ei_hkl = 2.072*Ki**2.0;

        if(lambda>Lambda_min && lambda<Lambda_max && G_sq > 0){   //  the case that H=K=L=0 is avoided by the condition of  G_sq > 0.

            let phiv = Math.atan2(Ghkl[2], Math.sqrt((Ghkl[0]+Ki)**2.0+Ghkl[1]**2.0));
            let phih = Math.atan2(Ghkl[1],Ghkl[0]+Ki);
            let phi_deg = Math.asin(Math.sqrt(G_sq)/(2.0*Ki))*2.0/Math.PI*180.0;
            let phih_deg = phih/Math.PI*180.0;
            let phiv_deg = phiv/Math.PI*180.0;

            const delta_pixels=phihv2pixels(phih,phiv);
            let PosX=ofst_X+delta_pixels[0];
            let PosY=canvas.height/2 +center_ofst_Y-delta_pixels[1];

            if(PosX>=0 && PosX<scaleX && PosY >= 0 && PosY <=scaleY){
                context1.beginPath();

                if(isTargetHKL1==true){
        
                    document.getElementById("Q_len").innerHTML=Math.round(Math.sqrt(G_sq)*decimal_digit)/decimal_digit;
                    document.getElementById("phi").innerHTML=Math.round(phi_deg*decimal_digit)/decimal_digit;
                    document.getElementById("phih").innerHTML=Math.round(phih_deg*decimal_digit)/decimal_digit;
                    document.getElementById("phiv").innerHTML=Math.round(phiv_deg*decimal_digit)/decimal_digit;
                    document.getElementById("lambda").innerHTML=Math.round(lambda*decimal_digit)/decimal_digit;
                    //const Az_angle_deg=Math.atan2(Ghkl[2],Ghkl[1])/Math.PI*180.0;
                    //document.getElementById("Azimuth").innerHTML=Math.round(Az_angle_deg*decimal_digit)/decimal_digit;
                    context1.arc(PosX,PosY, radius_tgt, 0, 2 * Math.PI);
                }
                else{
                    context1.arc(PosX,PosY, radius, 0, 2 * Math.PI);
                }
                context1.stroke();

                if(showHKL1==true){
                    context1.fillText(String(-Math.round(H1*decimal_digit)/decimal_digit)+String(-Math.round(K1*decimal_digit)/decimal_digit)+String(-Math.round(L1*decimal_digit)/decimal_digit), PosX, PosY+txt_ofst1);   
                    //Thus far, the Bragg conditions are calculated assuming that the scattering vector is defined as Q=kf-ki.
                    //However, the correct definition of the scattering vector is Q=ki-kf, which is momentum of the excitation. Thus, "-" signs are necessary to change Q=kf-ki to Q=ki-kf.
                }

                return_value=true;
            }
        }
    }
    
    return return_value;

}

function phihv2pixels(phih,phiv){    // convert phih to detector number
    let delta_pixels=[-999,-1];
    let bankNum=-1;
    if (DetBankSide=="BL17side"){
        for(let i=0;i<BankNumBL17side; i++){
            if((phih >= BankHorAngleMin[i]) && (phih <= BankHorAngleMax[i])){
                bankNum=i;
            }
        }
    
        if(bankNum>=0){
            delta_pixels[0] = L2b*(Math.tan(alpha[bankNum]- phih))*mm2Xpixel;
            delta_pixels[0] += BankWidth/2.0*mm2Xpixel + bankNum*((BankWidth)*mm2Xpixel+bank_gap_disp);
            const det_Y =L2b*Math.sqrt(1.0+Math.tan(Math.abs(phih-alpha[bankNum]))**2.0)*Math.tan(phiv); // in mm 
    
            if((det_Y<BankWidth/2.0)&&(det_Y>-BankWidth/2.0)){
                delta_pixels[1] = det_Y*mm2Ypixel;
            }
            else if((det_Y<BankWidth*3.0/2.0+Bank_VGap)&&(det_Y>BankWidth/2.0+Bank_VGap)){
                delta_pixels[1] = (det_Y-(BankWidth/2.0+Bank_VGap))*mm2Ypixel + BankWidth/2.0*mm2Ypixel + bank_gap_disp;
            }
            else if((det_Y>-BankWidth*3.0/2.0-Bank_VGap)&&(det_Y<-BankWidth/2.0-Bank_VGap)){
                delta_pixels[1] = (det_Y-(-BankWidth/2.0-Bank_VGap))*mm2Ypixel - BankWidth/2.0*mm2Ypixel - bank_gap_disp;
            }
            else {
                delta_pixels[0] = -999;
            }
        }
    }
    else{
        for(let i=BankNumBL17side;i<BankNumBL17side+BankNumBL19side; i++){
            if((phih >= BankHorAngleMin[i]) && (phih <= BankHorAngleMax[i])){
                bankNum=i;
            }
        }
    
        if(bankNum>=0){
            delta_pixels[0] = -L2b*(Math.tan(phih-alpha[bankNum]))*mm2Xpixel;
            delta_pixels[0] += BankWidth/2.0*mm2Xpixel + (bank_gap_disp+BankWidth*mm2Xpixel)*(4.0 - (bankNum-BankNumBL17side));
            const det_Y =L2b*Math.sqrt(1.0+Math.tan(Math.abs(phih-alpha[bankNum]))**2.0)*Math.tan(phiv); // in mm 
    
            if((det_Y<BankWidth/2.0)&&(det_Y>-BankWidth/2.0)){
                delta_pixels[1] = det_Y*mm2Ypixel;
            }
            else if((det_Y<BankWidth*3.0/2.0+Bank_VGap)&&(det_Y>BankWidth/2.0+Bank_VGap)){
                delta_pixels[1] = (det_Y-(BankWidth/2.0+Bank_VGap))*mm2Ypixel + BankWidth/2.0*mm2Ypixel + bank_gap_disp;
            }
            else if((det_Y>-BankWidth*3.0/2.0-Bank_VGap)&&(det_Y<-BankWidth/2.0-Bank_VGap)){
                delta_pixels[1] = (det_Y-(-BankWidth/2.0-Bank_VGap))*mm2Ypixel - BankWidth/2.0*mm2Ypixel - bank_gap_disp;
            }
            else {
                delta_pixels[0] = -999;
            }
        }
    }

    return delta_pixels; 

}



function rot_Lattice(rot_ax_dir){
    let angle = 0.0;  // radian unit
    let xyz         // xyz=(0,1,2) for (x, y, z)-axis respectively.
    switch(rot_ax_dir){
        case 'rot_x_plus':
            angle = Number(document.getElementById('rot_x_deg').value)/180.0*Math.PI;
            xyz =0.0;
            break;
        case 'rot_x_minus':
            angle = (-1.0)*Number(document.getElementById('rot_x_deg').value)/180.0*Math.PI;
            xyz =0.0;
            break;
        case 'rot_y_plus':
            angle = Number(document.getElementById('rot_y_deg').value)/180.0*Math.PI;
            xyz =1.0;
            break;
        case 'rot_y_minus':
            angle = (-1.0)*Number(document.getElementById('rot_y_deg').value)/180.0*Math.PI;
            xyz =1.0;
            break;
        case 'rot_z_plus':
            angle = Number(document.getElementById('rot_z_deg').value)/180.0*Math.PI;
            xyz =2.0;
            break;
        case 'rot_z_minus':
            angle = (-1.0)*Number(document.getElementById('rot_z_deg').value)/180.0*Math.PI;
            xyz =2.0;
            break;
        default:
    }
    xyz_rotation(xyz,angle);
}

function xyz_rotation(xyz,angle){
    //xyz : 0=x, 1=y, 2=z
    //angle : rotation angle (radian units)
    let r00;
    let r01;

    r00=a_star[(xyz+1)%3]*Math.cos(angle)-a_star[(xyz+2)%3]*Math.sin(angle);
    r01=a_star[(xyz+1)%3]*Math.sin(angle)+a_star[(xyz+2)%3]*Math.cos(angle);
    a_star[(xyz+1)%3]=r00;
    a_star[(xyz+2)%3]=r01;
    r00=b_star[(xyz+1)%3]*Math.cos(angle)-b_star[(xyz+2)%3]*Math.sin(angle);
    r01=b_star[(xyz+1)%3]*Math.sin(angle)+b_star[(xyz+2)%3]*Math.cos(angle);
    b_star[(xyz+1)%3]=r00;
    b_star[(xyz+2)%3]=r01;
    r00=c_star[(xyz+1)%3]*Math.cos(angle)-c_star[(xyz+2)%3]*Math.sin(angle);
    r01=c_star[(xyz+1)%3]*Math.sin(angle)+c_star[(xyz+2)%3]*Math.cos(angle);
    c_star[(xyz+1)%3]=r00;
    c_star[(xyz+2)%3]=r01;
}



function showUBmatrix(){
    document.getElementById('as_x').value = Math.round((a_star[0]*decimal_digit))/decimal_digit;
    document.getElementById('as_y').value = Math.round((a_star[1]*decimal_digit))/decimal_digit;
    document.getElementById('as_z').value = Math.round((a_star[2]*decimal_digit))/decimal_digit;
    document.getElementById('bs_x').value = Math.round((b_star[0]*decimal_digit))/decimal_digit;
    document.getElementById('bs_y').value = Math.round((b_star[1]*decimal_digit))/decimal_digit;
    document.getElementById('bs_z').value = Math.round((b_star[2]*decimal_digit))/decimal_digit;
    document.getElementById('cs_x').value = Math.round((c_star[0]*decimal_digit))/decimal_digit;
    document.getElementById('cs_y').value = Math.round((c_star[1]*decimal_digit))/decimal_digit;
    document.getElementById('cs_z').value = Math.round((c_star[2]*decimal_digit))/decimal_digit;

}

//--------------------------------------

function setFreeRotMode(){
    document.getElementById("freeRot").disabled=false;
    document.getElementById("freeRot").checked=true;
    document.getElementById("omegaRot").disabled=true;
    document.getElementById("rot_x_plus").disabled=false;
    document.getElementById("rot_x_minus").disabled=false;
    document.getElementById("rot_y_plus").disabled=false;
    document.getElementById("rot_y_minus").disabled=false;
    document.getElementById("rot_z_plus").disabled=false;
    document.getElementById("rot_z_minus").disabled=false;
    document.getElementById("omgRotGoBtn").disabled=true;
    document.getElementById("targetOmega").disabled=true;

    document.getElementById("rot_x_deg").disabled=false;
    document.getElementById("rot_y_deg").disabled=false;
    document.getElementById("rot_z_deg").disabled=false;
    document.getElementById("omg_CCW").disabled=false;
    document.getElementById("omg_CW").disabled=false;
}

function setOmegaRotMode(){
    Omega = Number(document.getElementById("currentOmega").value);
    document.getElementById("omegaRot").disabled=false;
    document.getElementById("omegaRot").checked=true;
    document.getElementById("freeRot").disabled=false;
    document.getElementById("rot_x_plus").disabled=true;
    document.getElementById("rot_x_minus").disabled=true;
    document.getElementById("rot_y_plus").disabled=true;
    document.getElementById("rot_y_minus").disabled=true;
    document.getElementById("rot_z_plus").disabled=true;
    document.getElementById("rot_z_minus").disabled=true;
    document.getElementById("currentOmega_disp").innerHTML=String(Omega);
    document.getElementById("omgRotGoBtn").disabled=false;
    document.getElementById("targetOmega").disabled=false;

    document.getElementById("rot_x_deg").disabled=true;
    document.getElementById("rot_y_deg").disabled=true;
    document.getElementById("rot_z_deg").disabled=true;
    document.getElementById("omg_CCW").disabled=true;
    document.getElementById("omg_CW").disabled=true;

    let psi_h = Math.atan2((u[0]*a_star[1]+u[1]*b_star[1]+u[2]*c_star[1]),(u[0]*a_star[0]+u[1]*b_star[0]+u[2]*c_star[0]))/Math.PI*180.0;
    let Omg_ofst = Omega+psi_h;
//    document.getElementById("Omg_ofst").innerHTML=String(Math.round((Omg_ofst*decimal_digit))/decimal_digit);
}

function draw_OriViewer(){
    // サイズを指定
    const width = 800;
    const height = 400;
  
    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector('#OrientationViewer'),
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0xf8f8f8);
  
    // シーンを作成
    const scene = new THREE.Scene();
  
    // カメラを作成
    const camera = new THREE.PerspectiveCamera(30, width / height);
    let cam_theta=Number(document.getElementById("cam_theta").value);
    let cam_phi=Number(document.getElementById("cam_phi").value);
    let cam_len=1200;
    camera.position.set(cam_len*Math.sin(Math.PI/180.0*cam_theta)*Math.sin(Math.PI/180.0*cam_phi), cam_len*Math.cos(Math.PI/180.0*cam_theta), cam_len*Math.sin(Math.PI/180.0*cam_theta)*Math.cos(Math.PI/180.0*cam_phi));
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  
    //note: 
    //HRC coordinates (x(||ki),y,z(vertical)) 
    //THREE.js coordinates (x3,y3,z3) 
    //transformation : x3=x, y3=z, z3=-y  
    // detector banks
    let material_BL17side = new THREE.MeshStandardMaterial({ color: 0x808080});  // color of detector bank
    if(DetBankSide=="BL17side"){
        material_BL17side.color.set(0xc08080);  
    }
    let geometry_BL17side = new Array(BankNumBL17side*3);
    let mesh_BL17side = new Array(BankNumBL17side*3);
    for (let i=0;i<BankNumBL17side;i++){
        geometry_BL17side[i] = new THREE.BoxGeometry(DetBankThickness, (BankWidth)*DetBankScale, BankWidth*DetBankScale);
        mesh_BL17side[i] = new THREE.Mesh(geometry_BL17side[i], material_BL17side);
        scene.add(mesh_BL17side[i]);
        mesh_BL17side[i].rotation.y += (alpha[i]);       //rotation about the y axis.
        mesh_BL17side[i].position.x += DetBankScale*Porg_center[i][2];    // move along the x axis.
        mesh_BL17side[i].position.z -= DetBankScale*Porg_center[i][0];    // move along the z axis.    

        geometry_BL17side[i+1] = new THREE.BoxGeometry(DetBankThickness, (BankWidth)*DetBankScale, BankWidth*DetBankScale);
        mesh_BL17side[i+1] = new THREE.Mesh(geometry_BL17side[i+1], material_BL17side);
        scene.add(mesh_BL17side[i+1]);
        mesh_BL17side[i+1].rotation.y += (alpha[i]);       //rotation about the y axis.
        mesh_BL17side[i+1].position.x += DetBankScale*Porg_center[i][2];    // move along the x axis.
        mesh_BL17side[i+1].position.z -= DetBankScale*Porg_center[i][0];    // move along the z axis.    
        mesh_BL17side[i+1].position.y += DetBankScale*(BankWidth+Bank_VGap);    // move along the y axis. (vertical)       

        geometry_BL17side[i+2] = new THREE.BoxGeometry(DetBankThickness, (BankWidth)*DetBankScale, BankWidth*DetBankScale);
        mesh_BL17side[i+2] = new THREE.Mesh(geometry_BL17side[i+2], material_BL17side);
        scene.add(mesh_BL17side[i+2]);
        mesh_BL17side[i+2].rotation.y += (alpha[i]);       //rotation about the y axis.
        mesh_BL17side[i+2].position.x += DetBankScale*Porg_center[i][2];    // move along the x axis.
        mesh_BL17side[i+2].position.z -= DetBankScale*Porg_center[i][0];    // move along the z axis.    
        mesh_BL17side[i+2].position.y -= DetBankScale*(BankWidth+Bank_VGap);    // move along the y axis. (vertical)    
    }

    let material_BL19side = new THREE.MeshStandardMaterial({ color: 0x808080 });  // color of detector bank
    if(DetBankSide=="BL19side"){
        material_BL19side.color.set(0xc08080);  
    }
    let geometry_BL19side = new Array(BankNumBL19side*3);
    let mesh_BL19side = new Array(BankNumBL19side*3);
    const numofst = BankNumBL17side - BankNumBL19side;
    for (let i=0;i<BankNumBL19side;i++){
        geometry_BL19side[i] = new THREE.BoxGeometry(DetBankThickness, (BankWidth)*DetBankScale, BankWidth*DetBankScale);
        mesh_BL19side[i] = new THREE.Mesh(geometry_BL19side[i], material_BL19side);
        scene.add(mesh_BL19side[i]);
        mesh_BL19side[i].rotation.y -= (alpha[numofst+i]);       //rotation about the y axis.
        mesh_BL19side[i].position.x += DetBankScale*Porg_center[numofst+i][2];    // move along the x axis.
        mesh_BL19side[i].position.z += DetBankScale*Porg_center[numofst+i][0];    // move along the z axis.    

        geometry_BL19side[i+1] = new THREE.BoxGeometry(DetBankThickness, (BankWidth)*DetBankScale, BankWidth*DetBankScale);
        mesh_BL19side[i+1] = new THREE.Mesh(geometry_BL19side[i+1], material_BL19side);
        scene.add(mesh_BL19side[i+1]);
        mesh_BL19side[i+1].rotation.y -= (alpha[numofst+i]);       //rotation about the y axis.
        mesh_BL19side[i+1].position.x += DetBankScale*Porg_center[numofst+i][2];    // move along the x axis.
        mesh_BL19side[i+1].position.z += DetBankScale*Porg_center[numofst+i][0];    // move along the z axis.    
        mesh_BL19side[i+1].position.y += DetBankScale*(BankWidth+Bank_VGap);    // move along the y axis. (vertical)       

        geometry_BL19side[i+2] = new THREE.BoxGeometry(DetBankThickness, (BankWidth)*DetBankScale, BankWidth*DetBankScale);
        mesh_BL19side[i+2] = new THREE.Mesh(geometry_BL19side[i+2], material_BL19side);
        scene.add(mesh_BL17side[i+2]);
        mesh_BL19side[i+2].rotation.y -= (alpha[numofst+i]);       //rotation about the y axis.
        mesh_BL19side[i+2].position.x += DetBankScale*Porg_center[numofst+i][2];    // move along the x axis.
        mesh_BL19side[i+2].position.z += DetBankScale*Porg_center[numofst+i][0];    // move along the z axis.    
        mesh_BL19side[i+2].position.y -= DetBankScale*(BankWidth+Bank_VGap);    // move along the y axis. (vertical)    
    }

    // guide for the incident beam
    const material1 = new THREE.MeshStandardMaterial({ color: 0x808080 });  // color of detector bank
    const geometry_guide = new THREE.BoxGeometry(2000,50,50);
    const mesh_guide = new THREE.Mesh(geometry_guide, material1);
    scene.add(mesh_guide);
    mesh_guide.position.x -= 1300;
    
    //draw a*, b*, c*
    //a*
    var dir = new THREE.Vector3( a_star[0],a_star[2], -a_star[1] );
    var origin = new THREE.Vector3( 0, 0, 0 );
    var arrow_len = dir.length()*arrow_scale;
    var hex = 0xff0000;
    var arrowHelper = new THREE.ArrowHelper( dir.normalize(), origin, arrow_len, hex ,arrow_HeadLen,arrow_HeadWidth);
    scene.add(arrowHelper);
  
    //b*
    dir = new THREE.Vector3( b_star[0],b_star[2], -b_star[1] );
    arrow_len = dir.length()*arrow_scale;
    hex = 0x00ff00;
    arrowHelper = new THREE.ArrowHelper( dir.normalize(), origin, arrow_len, hex ,arrow_HeadLen,arrow_HeadWidth);
    scene.add(arrowHelper);
 
    //c*
    dir = new THREE.Vector3( c_star[0],c_star[2], -c_star[1] );
    arrow_len = dir.length()*arrow_scale;
    hex = 0x0000ff;
    arrowHelper = new THREE.ArrowHelper( dir.normalize(), origin,arrow_len, hex ,arrow_HeadLen,arrow_HeadWidth);
    scene.add(arrowHelper);
  
  
    // 平行光源
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(-150, 240, 500);
    scene.add(directionalLight);
  
    const light = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(light);  
    // ポイント光源
  //  const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
  //  scene.add(pointLight);
  //  const pointLightHelper = new THREE.PointLightHelper(pointLight, 3);
  //  scene.add(pointLightHelper);
  
    renderer.render(scene, camera);
  
}
