function queryStringOptimizer(queryString: string){
    return queryString.replace(/'/g, "''");
}

export {queryStringOptimizer}