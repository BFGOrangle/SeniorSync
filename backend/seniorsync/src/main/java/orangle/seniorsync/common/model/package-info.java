/**
 * Common model package containing shared entity classes and filter definitions.
 * 
 * This package defines the tenant filter used across multiple entities for multi-tenancy support.
 */
@FilterDef(name = "tenantFilter", parameters = {@ParamDef(name = "centerId", type = Long.class)})
package orangle.seniorsync.common.model;

import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
