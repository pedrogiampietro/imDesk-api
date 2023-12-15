import express, { Request, Response } from "express";
import oracledb from "oracledb";

const router = express.Router();

//buscar atendimentos por localidade
router.get(
  "/services-by-locations",
  async (request: Request, response: Response) => {
    let connection;

    // Parâmetros de paginação
    const page = parseInt(request.query.page as string) || 1;
    const pageSize = parseInt(request.query.perPage as string) || 20;

    console.log("Page:", page, "PageSize:", pageSize);

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    try {
      connection = await oracledb.getConnection();

      // Consulta para obter o total de registros
      const totalResult: any = await connection.execute(
        `SELECT COUNT(*) AS total FROM (
         SELECT DISTINCT a.DT_ATENDIMENTO, l.cd_uf, l.nm_localidade, b.ds_bairro
         FROM paciente p, atendime a, cep_localidades l, cep_bairros b, cep_logradouros lo, prestador pr
         WHERE p.cd_paciente = a.CD_PACIENTE
         AND a.DT_ATENDIMENTO BETWEEN To_Date('01/09/2022','dd/mm/yyyy') and To_Date('01/11/2022','dd/mm/yyyy') 
         AND lo.nr_cep = p.nr_cep
         AND a.TP_ATENDIMENTO = 'I'
         AND a.CD_MULTI_EMPRESA = 3
         AND b.cd_bairro = lo.cd_bairro_inicial
         AND pr.cd_prestador = a.CD_PRESTADOR
         AND lo.cd_localidade = l.cd_localidade
       )`
      );

      const totalRecords = totalResult.rows[0][0] || 0;

      const result = await connection.execute(
        `SELECT * FROM (
         SELECT a.*, ROWNUM rnum FROM (
           SELECT to_char(a.DT_ATENDIMENTO, 'DD/MM')DIA, l.cd_uf, l.nm_localidade, count (*) total, b.ds_bairro
           FROM paciente p , atendime a, cep_localidades l , cep_bairros b, cep_logradouros lo, prestador pr
           WHERE p.cd_paciente = a.CD_PACIENTE
           AND a.DT_ATENDIMENTO BETWEEN To_Date('01/09/2022','dd/mm/yyyy') and To_Date('01/11/2022','dd/mm/yyyy') 
           AND lo.nr_cep = p.nr_cep
           AND a.TP_ATENDIMENTO = 'I'
           AND a.CD_MULTI_EMPRESA = 3
           AND b.cd_bairro = lo.cd_bairro_inicial
           AND pr.cd_prestador = a.CD_PRESTADOR
           AND lo.cd_localidade = l.cd_localidade
           GROUP BY a.DT_ATENDIMENTO, l.cd_uf, l.nm_localidade, b.ds_bairro
           ORDER BY 1, 2 , 3 , 5
         ) a
         WHERE ROWNUM <= :offset + :limit
       ) WHERE rnum > :offset`,
        { offset, limit }
      );

      return response.status(200).json({
        message: "Services by location retrieved successfully",
        body: result.rows,
        totalRecords,
        currentPage: page,
        pageSize,
        error: false,
      });
    } catch (err: any) {
      return response.status(500).json(err);
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error("Erro ao fechar a conexão:", error);
        }
      }
    }
  }
);

router.get(
  "/consume-medicaments-hmmr",
  async (request: Request, response: Response) => {
    let connection;

    const page = parseInt(request.query.page as string) || 1;
    const pageSize = parseInt(request.query.perPage as string) || 20;
    const offset = (page - 1) * pageSize;

    console.log(`Offset: ${offset}, PageSize: ${pageSize}`);

    try {
      connection = await oracledb.getConnection();

      // Consulta para obter o total de registros
      const totalResult: any = await connection.execute(
        `SELECT COUNT(*) AS total FROM (
         SELECT DISTINCT to_char(me.dt_mvto_estoque, 'MM/RRRR') mesano
         FROM produto p 
         JOIN itmvto_estoque ie ON ie.cd_produto = p.cd_produto 
         JOIN mvto_estoque me ON ie.cd_mvto_estoque = me.cd_mvto_estoque 
         JOIN especie e ON p.cd_especie = e.cd_especie 
         JOIN estoque ee ON ee.cd_estoque = me.cd_estoque 
         JOIN uni_pro ui ON ui.cd_uni_pro = ie.cd_uni_pro 
         WHERE to_char(me.dt_mvto_estoque, 'rrrr') = '2023'
         AND e.cd_especie IN (1) 
         AND me.tp_mvto_estoque IN ('S', 'P', 'D', 'C', 'N', 'V')
         AND ee.cd_multi_empresa IN (3)
       )`
      );

      const totalRecords = totalResult.rows[0][0] || 0;

      // Consulta paginada de consumo de medicamentos
      const result = await connection.execute(
        `SELECT * FROM (
         SELECT a.*, ROWNUM rnum FROM (
           SELECT 
             SUM(round(decode(me.tp_mvto_estoque, 'D', -1, 'C', -1, 'N', -1, 1) * (ie.QT_MOVIMENTACAO * ui.vl_fator) * dbamv.verif_vl_custo_medio(ie.cd_produto, me.dt_mvto_estoque, 'H', p.vl_custo_medio, me.hr_mvto_estoque, me.cd_multi_empresa), 4)) consumo,
             to_char(me.dt_mvto_estoque, 'MM/RRRR') mesano, 
             to_char(me.dt_mvto_estoque, 'MM') mes, 
             to_char(me.dt_mvto_estoque, 'RRRR') ano, 
             ds_especie especie, 
             e.cd_especie, 
             me.cd_multi_empresa 
           FROM produto p 
           JOIN itmvto_estoque ie ON ie.cd_produto = p.cd_produto 
           JOIN mvto_estoque me ON ie.cd_mvto_estoque = me.cd_mvto_estoque 
           JOIN especie e ON p.cd_especie = e.cd_especie 
           JOIN estoque ee ON ee.cd_estoque = me.cd_estoque 
           JOIN uni_pro ui ON ui.cd_uni_pro = ie.cd_uni_pro 
           WHERE to_char(me.dt_mvto_estoque, 'rrrr') = '2023'
           AND e.cd_especie IN (1) 
           AND me.tp_mvto_estoque IN ('S', 'P', 'D', 'C', 'N', 'V')
           AND ee.cd_multi_empresa IN (3)
           GROUP BY to_char(me.dt_mvto_estoque, 'MM/RRRR'), to_char(me.dt_mvto_estoque, 'MM'), to_char(me.dt_mvto_estoque, 'RRRR'), ds_especie, e.cd_especie, me.cd_multi_empresa 
           ORDER BY ano asc, mes asc
         ) a
         WHERE ROWNUM <= :offset + :limit
       ) WHERE rnum > :offset`,
        { offset, limit: pageSize }
      );

      return response.status(200).json({
        message: "Consumo de medicamentos recuperado com sucesso",
        body: result.rows,
        totalRecords,
        currentPage: page,
        pageSize,
        error: false,
      });
    } catch (err: any) {
      return response
        .status(500)
        .json({ errorNum: err.errorNum, offset: err.offset });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error("Erro ao fechar a conexão:", error);
        }
      }
    }
  }
);

export default router;
