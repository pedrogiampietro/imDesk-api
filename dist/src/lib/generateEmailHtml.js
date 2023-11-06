"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmailHtml = void 0;
function generateEmailHtml(description, subject, to) {
    const data = description.indexOf(",");
    let getTitle = "";
    let getDescription = "";
    if (data !== -1) {
        getTitle = description.substring(0, data);
        getDescription = description.substring(data + 1);
    }
    else {
        console.log("No comma found in string.");
    }
    return `
      <!DOCTYPE html>
      <html lang="pt-br">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
     </head>
      <body>
      <table style="border-spacing: 0px; border-collapse: collapse; width: 100%;" border="0" width="100%" cellspacing="0" cellpadding="0">
      <tbody>
         <tr>
            <td class="x_outer" style="font-family: Arial, sans-serif; min-width: 600px; border-collapse: collapse; background-color: #ebeff2; width: 100%;" valign="top">
               <table id="x_boxing" class="x_m_boxing" style="border-spacing: 0; border-collapse: collapse; margin: 0 auto 0 auto;" border="0" width="640" cellspacing="0" cellpadding="0" align="center">
                  <tbody>
                     <tr>
                        <td id="x_template-wrapper" class="x_mktoContainer x_boxedbackground" style="word-break: break-word; font-family: Arial,sans-serif; border-collapse: collapse;">
                           <p> </p>
                           <table id="x_hero" class="x_mktoModule x_m_hero" style="border-spacing: 0; border-collapse: collapse;" border="0" width="100%" cellspacing="0" cellpadding="0">
                              <tbody>
                                 <tr>
                                    <td class="x_background" valign="top" bgcolor="#232D37" width="640" height="99px" data-imagetype="External">
                                       <center>
                                          <table class="x_table600" style="border-spacing: 0; border-collapse: collapse; margin: 0 auto 0 auto;" border="0" width="580" cellspacing="0" cellpadding="0" align="center">
                                             <tbody>
                                                <tr>
                                                   <td class="x_primary-font x_subtitle" style="word-break: break-word; font-family: Arial,sans-serif; text-align: left; color: black; font-weight: bold; font-size: 17px; border-collapse: collapse; padding-top: 5px;"> </td>
                                                </tr>
                                                <tr>
                                                   <td class="x_primary-font x_title" style="word-break: break-word; font-family: Arial,sans-serif; font-size: 60px; line-height: 30px; color: #32ad84; text-align: left; border-collapse: collapse; padding-bottom: 30px; padding-top: 35px;">
                                                      <div id="x_title" class="x_mktoText">
                                                         <div style="text-align: center;">
                                                            <span style="color: #ffffff; font-size: 24px;"><span style="color: #ffffff; font-size: 24px;">imDesk</span></span>
                                                            <div style="text-align: center;"><span style="font-size: 18px;"> <span style="color: #ffffff;"> Central de Atendimento ao Cliente </span> </span></div>
                                                         </div>
                                                      </div>
                                                   </td>
                                                </tr>
                                                <tr>
                                                   <td class="x_primary-font x_subtitle" style="word-break: break-word; font-family: Arial,sans-serif; text-align: left; color: black; font-weight: bold; font-size: 17px; border-collapse: collapse; padding-top: 20px;"> </td>
                                                </tr>
                                             </tbody>
                                          </table>
                                       </center>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                           <table id="x_free-text" class="x_mktoModule x_m_free-text" style="border-spacing: 0; border-collapse: collapse;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
                              <tbody>
                                 <tr>
                                    <td style="word-break: break-word; font-family: Arial,sans-serif; border-collapse: collapse; background-color: #ffffff;" valign="top" bgcolor="#FFFFFF">
                                       <center>
                                          <table class="x_table600" style="border-spacing: 0; border-collapse: collapse; margin: 0 auto 0 auto;" border="0" width="580" cellspacing="0" cellpadding="0" align="center">
                                             <tbody>
                                                <tr>
                                                   <td style="word-break: break-word; font-family: Arial,sans-serif; border-collapse: collapse; line-height: 25px; font-size: 25px;" height="25px"> </td>
                                                </tr>
                                                <tr>
                                                   <td class="x_primary-font x_text" style="word-break: break-word; font-family: Arial,sans-serif; font-size: 14px; color: #333333; line-height: 170%; border-collapse: collapse;">
                                                      <div id="x_text4" class="x_mktoText">
                                                         <p style="text-align: justify;"><span style="font-size: 16px;"> Olá ${to}, </span></p>
                                                         <p style="text-align: justify;"><span style="font-size: 16px;"> Informamos que foi aberto um novo registro no Sistema de Atendimento a usuários com o resumo de <strong>${getDescription.slice(0, 150)}</strong>. </span></p>
                                                         <p style="text-align: justify;"><span style="font-size: 16px;"> Este atendimento sera gerenciado sob o seguinte protocolo: </span></p>
                                                         <center><strong><a class="x_primary-font x_button" style="display: inline-block; font-size: 14px; font-family: Arial,sans-serif; color: white; text-decoration: none; background-color: #f18900; border-bottom-left-radius: 4px; border-top-left-radius: 4px; border-bottom-right-radius: 4px; border-top-right-radius: 4px; padding: 12px 18px 12px 18px; border: 1px solid #FFFFFF;" href="#" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable"> &lt; ${getTitle} &gt;</a></strong></center>
                                                         <center></center>
                                                         <p><span style="font-size: 16px;">Sinta-se a vontade para acessar o Sistema para interagir ou buscar maiores detalhes sobre este atendimento a qualquer momento! </span></p>
                                                         <p><span style="font-size: 16px;"> Acessando o sistema você pode: </span></p>
                                                         <ul>
                                                            <li><span style="font-size: 14px;"> Acompanhar em tempo real seus atendimentos. </span></li>
                                                            <li><span style="font-size: 14px;"> Abrir novas requisições, reduzindo o tempo de atendimento. </span></li>
                                                            <li><span style="font-size: 14px;"> Ajudar a melhorar nosso atendimento por meio de avaliações. </span></li>
                                                         </ul>
                                                      </div>
                                                   </td>
                                                </tr>
                                                <tr>
                                                   <td style="word-break: break-word; font-family: Arial,sans-serif; border-collapse: collapse; line-height: 5px; font-size: 5px;" height="5px"> </td>
                                                </tr>
                                             </tbody>
                                          </table>
                                       </center>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                           <table id="x_standard-image" class="x_mktoModule x_m_standard-image" style="border-spacing: 0; border-collapse: collapse;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
                              <tbody>
                                 <tr>
                                    <td style="word-break: break-word; font-family: Arial,sans-serif; border-collapse: collapse; background-color: #ffffff;" valign="top" bgcolor="#FFFFFF">
                                       <center>
                                          <table class="x_table600" style="border-spacing: 0; border-collapse: collapse; margin: 0 auto 0 auto;" border="0" width="640" cellspacing="0" cellpadding="0" align="center">
                                             <tbody>
                                                <tr>
                                                   <td style="word-break: break-word; font-family: Arial,sans-serif; border-collapse: collapse; line-height: 20px; font-size: 20px;" height="20px"> </td>
                                                </tr>
                                             </tbody>
                                          </table>
                                       </center>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                           <table id="x_title5" class="x_mktoModule x_m_title" style="border-spacing: 0; border-collapse: collapse; font-family: Arial,sans-serif; text-align: center; color: #32ad84;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
                              <tbody>
                                 <tr>
                                    <td class="x_background" style="word-break: break-word; font-family: Arial,sans-serif; border-collapse: collapse; background-color: #ffffff;" valign="top" bgcolor="#ffffff"> </td>
                                 </tr>
                              </tbody>
                           </table>
                           <table id="x_footer" class="x_mktoModule x_m_footer" style="border-spacing: 0; border-collapse: collapse;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
                              <tbody>
                                 <tr>
                                    <td style="word-break: break-word; font-family: Arial,sans-serif; border-collapse: collapse; background-color: #232d37; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;" valign="top" bgcolor="#232D37">
                                       <center>
                                          <table class="x_table600" style="border-spacing: 0; border-collapse: collapse; margin: 0 auto 0 auto;" border="0" width="580" cellspacing="0" cellpadding="0" align="center">
                                             <tbody>
                                                <tr>
                                                   <td style="word-break: break-word; font-family: Arial,sans-serif; border-collapse: collapse; line-height: 20px; font-size: 20px;" height="20px"> </td>
                                                </tr>
                                                <tr>
                                                   <td style="word-break: break-word; font-family: Arial,sans-serif; border-collapse: collapse;">
                                                      <center>
                                                         <table class="x_table1-3" style="border-spacing: 0px; border-collapse: collapse; height: 119px;" border="0" width="389" cellspacing="0" cellpadding="0" align="left">
                                                            <tbody>
                                                               <tr style="height: 16px;">
                                                                  <td style="font-family: Arial, sans-serif; border-collapse: collapse; height: 16px; width: 387px;"><span style="color: #83909e; font-size: 12px;"><strong>imDesk</strong> Soluções em Tecnologia da Informação<br /><span class="LrzXr">Estrada do Galeão, 2920<br /></span></span><span style="color: #83909e; font-size: 12px;"><span class="LrzXr"> 50.030-210, Recife, PE, Brasil</span></span></td>
                                                               </tr>
                                                            </tbody>
                                                         </table>
                                                      </center>
                                                   </td>
                                                </tr>
                                                <tr>
                                                   <td style="word-break: break-word; font-family: Arial,sans-serif; border-collapse: collapse;"> </td>
                                                </tr>
                                             </tbody>
                                          </table>
                                       </center>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                           <table id="x_blankSpacea6849bce-b5d6-421a-9901-67787c142474" class="x_mktoModule x_m_blankSpace" style="border-spacing: 0; border-collapse: collapse;" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
                              <tbody>
                                 <tr>
                                    <td style="word-break: break-word; font-family: Arial,sans-serif; border-collapse: collapse; background-color: #ebeff2;" valign="top" bgcolor="#EBEFF2">
                                       <table class="x_table600" style="border-spacing: 0px; border-collapse: collapse; margin: 0px auto; height: 61px;" border="0" width="452" cellspacing="0" cellpadding="0" align="center">
                                          <tbody>
                                             <tr>
                                                <td class="x_primary-font x_title" style="font-family: Arial, sans-serif; font-size: 60px; line-height: 90%; color: #32ad84; text-align: left; border-collapse: collapse; width: 450px;">
                                                   <div id="x_copyright" class="x_mktoText">
                                                      <div class="x_p1" style="text-align: center;"><span style="color: #828f9d; font-size: 12px;"> © 2023 imDesk Soluções em TI - Todos os direitos reservados. </span></div>
                                                   </div>
                                                </td>
                                             </tr>
                                          </tbody>
                                       </table>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </td>
                     </tr>
                  </tbody>
               </table>
            </td>
         </tr>
      </tbody>
   </table>
   
      </body>
      </html>
    `;
}
exports.generateEmailHtml = generateEmailHtml;
